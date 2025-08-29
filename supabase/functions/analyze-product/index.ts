import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { imageBase64, userId, location } = await req.json();
    
    console.log('Analyzing product for user:', userId);

    // Analyze product with OpenAI Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `You are a product analysis assistant. Analyze the product image and extract:
            1. Product name (generic, e.g., "Greek Yogurt", "Whole Milk", "Cheddar Cheese")
            2. Brand name if visible
            3. Expiry date (look for "Best Before", "Use By", "Exp", "BB", etc.)
            4. Product category
            5. Any other relevant details (size, quantity, etc.)

            For expiry dates, look carefully at the packaging for printed dates. Common formats:
            - MM/DD/YYYY or DD/MM/YYYY
            - DD-MM-YYYY or MM-DD-YYYY  
            - DD.MM.YYYY or MM.DD.YYYY
            - Month DD, YYYY
            - DD Month YYYY
            - YYYYMMDD
            - Any other date format

            If the date format is ambiguous, use DD/MM/YYYY format by default (European standard).
            If no expiry date is found, return null for expiry_date.

            Return the data in JSON format:
            {
              "product_name": "Generic product name",
              "brand": "Brand name or null",
              "expiry_date": "YYYY-MM-DD or null",
              "category": "Choose from: Dairy, Meat & Poultry, Fruits & Vegetables, Bakery, Beverages, Snacks & Sweets, Pantry Staples, Frozen Foods, Personal Care, Household, Other",
              "size_info": "Size/quantity information if visible",
              "raw_text": "All visible text on the package",
              "confidence": "How confident you are about the expiry date (high/medium/low)"
            }`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this product image and extract the information, paying special attention to expiry dates.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_completion_tokens: 1500
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('AI response received');

    const content = aiResponse.choices[0].message.content;
    let productData;
    
    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        productData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse product data');
    }

    // Get product categories from database
    const { data: categories } = await supabase
      .from('product_categories')
      .select('id, name');

    const categoryMap = new Map(categories?.map(cat => [cat.name, cat.id]) || []);

    // Upload image to storage (convert base64 to Uint8Array for Deno)
    const fileName = `${userId}/${Date.now()}.jpg`;
    const binaryString = atob(imageBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('fridge-photos')
      .upload(fileName, bytes, {
        contentType: 'image/jpeg'
      });

    if (uploadError) {
      console.error('Image upload error:', uploadError);
      // Continue without image if upload fails
    }

    // Insert product into database
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        user_id: userId,
        name: productData.product_name,
        brand: productData.brand,
        expiry_date: productData.expiry_date,
        category_id: categoryMap.get(productData.category) || null,
        location: location || 'fridge',
        image_path: uploadData?.path || null,
        raw_ocr_text: productData.raw_text,
        notes: productData.size_info
      })
      .select()
      .single();

    if (productError) {
      console.error('Product insert error:', productError);
      throw new Error('Failed to save product');
    }

    console.log('Product saved with ID:', product.id);

    // Calculate days until expiry more accurately
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    
    let daysUntilExpiry = null;
    if (productData.expiry_date) {
      const expiryDate = new Date(productData.expiry_date);
      expiryDate.setHours(0, 0, 0, 0); // Reset time to start of day
      daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }

    return new Response(JSON.stringify({
      success: true,
      product_id: product.id,
      product_name: productData.product_name,
      brand: productData.brand,
      expiry_date: productData.expiry_date,
      category: productData.category,
      confidence: productData.confidence,
      days_until_expiry: daysUntilExpiry,
      today_date: today.toISOString().split('T')[0] // Include today's date for reference
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-product function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to analyze product'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});