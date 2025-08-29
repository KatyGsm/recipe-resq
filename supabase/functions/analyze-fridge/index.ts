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
    
    console.log('Analyzing fridge contents for user:', userId);

    // First, analyze the fridge contents with OpenAI Vision API
    const ingredientResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are a fridge content analyzer. Look at this fridge photo and identify all visible food items.

            Please identify:
            1. All visible food items (vegetables, fruits, dairy, meat, condiments, etc.)
            2. Estimate quantities where possible
            3. Note freshness level if visible
            4. Categorize items by type

            Return the data in JSON format:
            {
              "detected_items": [
                {
                  "name": "Standardized ingredient name",
                  "category": "vegetables|fruits|dairy|meat|pantry|condiments|other",
                  "quantity": "estimated amount or 'some'",
                  "freshness": "fresh|good|questionable|unknown",
                  "location": "shelf location if identifiable"
                }
              ],
              "total_items": "number of different items detected",
              "fridge_fullness": "empty|sparse|moderate|full|packed"
            }`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this fridge photo and identify all visible food items.'
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

    if (!ingredientResponse.ok) {
      const errorData = await ingredientResponse.text();
      console.error('OpenAI API error (ingredients):', errorData);
      throw new Error(`OpenAI API error: ${ingredientResponse.status}`);
    }

    const ingredientData = await ingredientResponse.json();
    console.log('Ingredient analysis received');

    let fridgeContents;
    try {
      const content = ingredientData.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        fridgeContents = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in ingredients response');
      }
    } catch (parseError) {
      console.error('Failed to parse ingredient response:', ingredientData.choices[0].message.content);
      throw new Error('Failed to parse fridge contents data');
    }

    // Now generate recipe suggestions based on detected ingredients
    const ingredientList = fridgeContents.detected_items.map(item => item.name).join(', ');
    
    const recipeResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are a chef assistant. Based on the available ingredients, suggest 3-5 practical recipes that can be made with these items.

            Focus on:
            1. Recipes that use the available ingredients effectively
            2. Simple, practical cooking methods
            3. Varied difficulty levels (easy, medium)
            4. Different meal types (breakfast, lunch, dinner, snack)
            5. Consider ingredient freshness levels

            Return JSON format:
            {
              "recipes": [
                {
                  "name": "Recipe name",
                  "difficulty": "easy|medium|hard",
                  "prep_time": "time in minutes",
                  "meal_type": "breakfast|lunch|dinner|snack|dessert",
                  "ingredients_used": ["ingredient1", "ingredient2"],
                  "missing_ingredients": ["common ingredient not in fridge"],
                  "instructions": ["step 1", "step 2", "step 3"],
                  "description": "Brief appetizing description"
                }
              ],
              "ingredient_usage": "percentage of detected ingredients that can be used",
              "cooking_tips": ["tip1", "tip2"]
            }`
          },
          {
            role: 'user',
            content: `Available ingredients in fridge: ${ingredientList}

            Please suggest recipes that can be made with these ingredients. Consider that some items may be running low or need to be used soon.`
          }
        ],
        max_completion_tokens: 2500
      }),
    });

    if (!recipeResponse.ok) {
      const errorData = await recipeResponse.text();
      console.error('OpenAI API error (recipes):', errorData);
      // Continue without recipes if this fails
    }

    let recipeData = { recipes: [], ingredient_usage: "0%", cooking_tips: [] };
    if (recipeResponse.ok) {
      try {
        const recipeResult = await recipeResponse.json();
        const content = recipeResult.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          recipeData = JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Failed to parse recipe response');
        // Continue with empty recipe data
      }
    }

    // Upload image to storage
    const fileName = `${userId}/fridge-${Date.now()}.jpg`;
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
      // Continue without image storage
    }

    console.log('Fridge analysis completed successfully');

    return new Response(JSON.stringify({
      success: true,
      fridge_contents: fridgeContents,
      recipe_suggestions: recipeData,
      image_path: uploadData?.path || null,
      analysis_summary: {
        total_ingredients: fridgeContents.detected_items.length,
        suggested_recipes: recipeData.recipes.length,
        fridge_fullness: fridgeContents.fridge_fullness,
        ingredient_usage: recipeData.ingredient_usage
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-fridge function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to analyze fridge contents'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});