// Data transformation utilities for Celler Hut API integration
// Maps between Celler Hut API responses and PickBazar data structures

// Using any types for flexibility during API integration
// TODO: Create proper interfaces once API integration is stable

// User/Profile transformation
export const transformCellerHutUser = (cellerHutUser: any): any => {
  return {
    id: cellerHutUser.id,
    name: cellerHutUser.name,
    email: cellerHutUser.email,
    created_at: cellerHutUser.created_at,
    updated_at: cellerHutUser.updated_at,
    is_active: cellerHutUser.is_active ?? true,
    profile: cellerHutUser.profile
      ? {
          id: cellerHutUser.profile.id,
          created_at: cellerHutUser.profile.created_at,
          updated_at: cellerHutUser.profile.updated_at,
          avatar: cellerHutUser.profile.avatar || null,
          bio: cellerHutUser.profile.bio || '',
          socials: cellerHutUser.profile.socials || [],
          contact: cellerHutUser.profile.contact,
          customer: cellerHutUser.profile.customer || null,
        }
      : null,
  };
};

// Address transformation (Celler Hut → PickBazar)
export const transformAddress = (cellerHutAddress: any) => {
  return {
    ...cellerHutAddress,
    street_address: cellerHutAddress.street || cellerHutAddress.street_address,
    state: cellerHutAddress.province || cellerHutAddress.state,
    zip: cellerHutAddress.postal_code || cellerHutAddress.zip,
  };
};

// Reverse address transformation (PickBazar → Celler Hut)
export const transformAddressForCellerHut = (pickBazarAddress: any) => {
  return {
    ...pickBazarAddress,
    street: pickBazarAddress.street_address || pickBazarAddress.street,
    province: pickBazarAddress.state || pickBazarAddress.province,
    postal_code: pickBazarAddress.zip || pickBazarAddress.postal_code,
  };
};

// Product transformation
export const transformCellerHutProduct = (cellerHutProduct: any): any => {
  return {
    id: cellerHutProduct.id,
    name: cellerHutProduct.name,
    slug: cellerHutProduct.slug,
    description: cellerHutProduct.description || '',
    type_id: cellerHutProduct.type.id,
    price: cellerHutProduct.costPrice,
    sale_price: cellerHutProduct.price,
    sku: cellerHutProduct.sku,
    quantity: cellerHutProduct.quantity || 0,
    in_stock: cellerHutProduct.in_stock ?? true,
    is_taxable: cellerHutProduct.is_taxable ?? true,
    status: cellerHutProduct.status || 'publish',
    product_type: cellerHutProduct.product_type || 'simple',
    unit: cellerHutProduct.unit || '1',
    height: cellerHutProduct.height,
    width: cellerHutProduct.width,
    length: cellerHutProduct.length,
    image: cellerHutProduct.image || null,
    gallery: cellerHutProduct.gallery || [],
    created_at: cellerHutProduct.created_at,
    updated_at: cellerHutProduct.updated_at,
    // Category mapping
    categories: cellerHutProduct.categories || [],

    // Additional fields as any to preserve liquor-specific data
    ...(cellerHutProduct.alcohol_content && {
      alcohol_content: cellerHutProduct.alcohol_content,
    }),
    ...(cellerHutProduct.volume && { volume: cellerHutProduct.volume }),
    ...(cellerHutProduct.origin && { origin: cellerHutProduct.origin }),
    ...(cellerHutProduct.vintage && { vintage: cellerHutProduct.vintage }),
    ...(cellerHutProduct.tasting_notes && {
      tasting_notes: cellerHutProduct.tasting_notes,
    }),
    ...(cellerHutProduct.food_pairings && {
      food_pairings: cellerHutProduct.food_pairings,
    }),
    ...(cellerHutProduct.serving_temperature && {
      serving_temperature: cellerHutProduct.serving_temperature,
    }),
    ...(cellerHutProduct.age_restricted !== undefined && {
      age_restricted: cellerHutProduct.age_restricted,
    }),
  };
};

// Order transformation
export const transformCellerHutOrder = (cellerHutOrder: any): any => {
  return {
    id: cellerHutOrder.id,
    tracking_number: cellerHutOrder.tracking_number,
    customer_id: cellerHutOrder.customer_id,
    customer_contact: cellerHutOrder.customer_contact,

    amount: cellerHutOrder.sub_total || cellerHutOrder.amount,
    sales_tax: cellerHutOrder.sales_tax || 0,
    total: cellerHutOrder.total,
    paid_total: cellerHutOrder.paid_total || cellerHutOrder.total,
    payment_id: cellerHutOrder.payment_id,
    payment_gateway: cellerHutOrder.payment_gateway || 'CASH_ON_DELIVERY',
    coupon_id: cellerHutOrder.coupon_id,
    shop_id: cellerHutOrder.shop_id,
    discount: cellerHutOrder.discount || 0,
    delivery_fee: cellerHutOrder.delivery_fee || 0,
    delivery_time: cellerHutOrder.delivery_time,
    products: cellerHutOrder.products || [],
    created_at: cellerHutOrder.created_at,
    updated_at: cellerHutOrder.updated_at,

    // Status mapping
    status: cellerHutOrder.status || 'order-pending',
    order_status: cellerHutOrder.order_status || 'order-pending',
    payment_status: cellerHutOrder.payment_status || 'payment-pending',

    // Address transformation
    billing_address: cellerHutOrder.billing_address
      ? transformAddress(cellerHutOrder.billing_address)
      : null,
    shipping_address: cellerHutOrder.shipping_address
      ? transformAddress(cellerHutOrder.shipping_address)
      : null,
  };
};

// Category transformation
export const transformCellerHutCategory = (cellerHutCategory: any): any => {
  return {
    id: cellerHutCategory.id,
    name: cellerHutCategory.name,
    slug: cellerHutCategory.slug,
    parent: cellerHutCategory.parent_id || null,
    children: cellerHutCategory.children || [],
    details: cellerHutCategory.details || '',
    image: {
      id: cellerHutCategory.image,
      original: cellerHutCategory.image,
      thumbnail: cellerHutCategory.image,
    },
    icon: 'Beverage', //cellerHutCategory.icon || '',

    created_at: cellerHutCategory.created_at,
    updated_at: cellerHutCategory.updated_at,

    // Liquor category specific
    liquor_type: cellerHutCategory.liquor_type,
    description: cellerHutCategory.description || '',
  };
};

// Pagination transformation
export const transformPagination = (cellerHutPagination: any) => {
  const currentPage =
    cellerHutPagination.current_page || cellerHutPagination.currentPage || 1;
  const perPage =
    cellerHutPagination.per_page || cellerHutPagination.perPage || 15;
  const total = cellerHutPagination.total || 0;
  const lastPage =
    cellerHutPagination.last_page ||
    cellerHutPagination.lastPage ||
    Math.ceil(total / perPage);

  return {
    count: total,
    current_page: currentPage,
    per_page: perPage,
    last_page: lastPage,
    total: total,
    firstItem:
      cellerHutPagination.first_item ||
      cellerHutPagination.firstItem ||
      (currentPage - 1) * perPage + 1,
    lastItem:
      cellerHutPagination.last_item ||
      cellerHutPagination.lastItem ||
      Math.min(currentPage * perPage, total),
    first_page_url: `/products?page=1`,
    last_page_url: `/products?page=${lastPage}`,
    next_page_url:
      currentPage < lastPage ? `/products?page=${currentPage + 1}` : null,
    prev_page_url: currentPage > 1 ? `/products?page=${currentPage - 1}` : null,
  };
};

// Generic transformer with type checking
export const transformCellerHutResponse = <T>(
  data: any,
  transformFunction: (item: any) => T,
): T | T[] => {
  if (Array.isArray(data)) {
    return data.map(transformFunction);
  }
  return transformFunction(data);
};

// Error transformation
export const transformCellerHutError = (error: any) => {
  return {
    statusCode: error.statusCode || 500,
    message: error.message || 'Internal server error',
    errors: error.errors || {},
  };
};

// Order creation payload transformation (PickBazar → Celler Hut)
export const transformOrderForCellerHut = (pickBazarOrder: any) => {
  return {
    ...pickBazarOrder,
    sub_total: pickBazarOrder.amount || pickBazarOrder.sub_total,
    billing_address: pickBazarOrder.billing_address
      ? transformAddressForCellerHut(pickBazarOrder.billing_address)
      : null,
    shipping_address: pickBazarOrder.shipping_address
      ? transformAddressForCellerHut(pickBazarOrder.shipping_address)
      : null,
  };
};
