import { supabase } from "./supabase";

export const addToCart = async (
  userId: string,
  productId: string
) => {
  // 1️⃣ Check if already in cart
  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .single();

  if (existing) {
    // 2️⃣ Update quantity
    await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + 1 })
      .eq("id", existing.id);
  } else {
    // 3️⃣ Insert new
    await supabase.from("cart_items").insert({
      user_id: userId,
      product_id: productId,
      quantity: 1,
    });
  }
};
