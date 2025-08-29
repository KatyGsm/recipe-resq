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

    const { imageBase64, userId } = await req.json();
    
    console.log('Processing receipt for user:', userId);

    // Analyze receipt with OpenAI Vision API
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
            content: `You are a receipt analysis assistant. Analyze the receipt image and extract:
            1. Store name
            2. Receipt date (in YYYY-MM-DD format)
            3. Total amount
            4. List of all products with their quantities and prices

            For each product, standardize the name to a generic product name (e.g., "Lidl Bio Milk 1L" becomes "Milk", "Rewe Vollkornbrot" becomes "Bread"). 

            Return the data in JSON format:
            {
              "store_name": "Store Name",
              "receipt_date": "2024-01-15",
              "total_amount": 25.99,
              "raw_text": "Full receipt text as extracted",
              "products": [
                {
                  "raw_name": "Original product name from receipt",
                  "standardized_name": "Generic product name",
                  "quantity": 1.0,
                  "unit_price": 2.99,
                  "total_price": 2.99,
                  "category": "Dairy" // Choose from: Dairy, Meat & Poultry, Fruits & Vegetables, Bakery, Beverages, Snacks & Sweets, Pantry Staples, Frozen Foods, Personal Care, Household, Other
                }
              ]
            }`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this receipt and extract the product information.'
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
        max_completion_tokens: 2000
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
    let receiptData;
    
    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        receiptData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse receipt data');
    }

    // Get product categories from database
    const { data: categories } = await supabase
      .from('product_categories')
      .select('id, name');

    const categoryMap = new Map(categories?.map(cat => [cat.name, cat.id]) || []);

    // Insert receipt into database
    const { data: receipt, error: receiptError } = await supabase
      .from('receipts')
      .insert({
        user_id: userId,
        store_name: receiptData.store_name,
        receipt_date: receiptData.receipt_date,
        total_amount: receiptData.total_amount,
        raw_text: receiptData.raw_text,
        processed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (receiptError) {
      console.error('Receipt insert error:', receiptError);
      throw new Error('Failed to save receipt');
    }

    console.log('Receipt saved with ID:', receipt.id);

    // Insert receipt items
    const items = receiptData.products.map((product: any) => ({
      receipt_id: receipt.id,
      raw_product_name: product.raw_name,
      standardized_name: product.standardized_name,
      quantity: product.quantity,
      unit_price: product.unit_price,
      total_price: product.total_price,
      product_category_id: categoryMap.get(product.category) || null
    }));

    const { error: itemsError } = await supabase
      .from('receipt_items')
      .insert(items);

    if (itemsError) {
      console.error('Receipt items insert error:', itemsError);
      throw new Error('Failed to save receipt items');
    }

    console.log('Receipt items saved successfully');

    return new Response(JSON.stringify({
      success: true,
      receipt_id: receipt.id,
      store_name: receiptData.store_name,
      total_amount: receiptData.total_amount,
      products_count: receiptData.products.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-receipt function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to process receipt'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});