export type PlaceResult = {
  business_name: string;
  phone: string | null;
  address: string | null;
  city: string;
  industry: string;
  rating: number | null;
  review_count: number | null;
  website_url: string | null;
  has_website: boolean;
  google_maps_url: string | null;
};

export async function searchPlaces(
  city: string,
  industry: string
): Promise<PlaceResult[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_MAPS_API_KEY is not set");

  const query = encodeURIComponent(`${industry} in ${city}`);
  const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`;

  const searchRes = await fetch(textSearchUrl);
  const searchData = await searchRes.json();

  if (searchData.status !== "OK" && searchData.status !== "ZERO_RESULTS") {
    throw new Error(
      `Google Places API error: ${searchData.status} - ${searchData.error_message || ""}`
    );
  }

  const places = searchData.results || [];

  // Fetch details for each place (up to 20)
  const detailPromises = places.slice(0, 20).map(async (place: {
    place_id: string;
    name: string;
    rating?: number;
    user_ratings_total?: number;
    formatted_address?: string;
    geometry?: { location: { lat: number; lng: number } };
  }) => {
    const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_phone_number,formatted_address,website,rating,user_ratings_total,url&key=${apiKey}`;

    try {
      const detailRes = await fetch(detailUrl);
      const detailData = await detailRes.json();
      const result = detailData.result;

      if (!result) return null;

      const hasWebsite = !!result.website;

      return {
        business_name: result.name || place.name,
        phone: result.formatted_phone_number || null,
        address: result.formatted_address || place.formatted_address || null,
        city,
        industry,
        rating: result.rating ?? place.rating ?? null,
        review_count: result.user_ratings_total ?? place.user_ratings_total ?? null,
        website_url: result.website || null,
        has_website: hasWebsite,
        google_maps_url: result.url || null,
      } as PlaceResult;
    } catch {
      return null;
    }
  });

  const results = await Promise.all(detailPromises);
  return results.filter((r): r is PlaceResult => r !== null);
}
