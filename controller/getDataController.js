import prisma from "../config/prismaClient.mjs";

export async function getUser(req, res) {
  try {
    const users = await prisma.users.findMany();
    console.log(users, "users");

    // Convert BigInt to string
    const usersWithStringIds = users.map((user) => ({
      ...user,
      id: user.id.toString(),
      company_id: user.company_id?.toString() || null,
    }));

    res.json(usersWithStringIds);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching users");
  }
}

// export const getLocation = async (req, res) => {
//   try {
//     const locations = await prisma.locations.findMany({
//       where: {
//         type_id: BigInt(4), // Make sure this matches your DB
//       },

//       include:{
//         review:{
//           select:{rating:true}
//         }
//       }
//     });

//     console.log(locations.slice(0, 10), "users");

//     // Convert BigInt fields to strings for frontend safety
//     const usersWithStringIds = locations.map((locations) => ({
//       ...locations,
//       id: locations.id.toString(),
//       parent_id: locations.parent_id?.toString() || null,
//       company_id: locations.company_id?.toString() || null,
//       type_id: locations.type_id?.toString() || null,
//     }));

//     res.json(usersWithStringIds);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error fetching users");
//   }
// };

export const getAllToilets = async (req, res) => {
  console.log("in all washrooms");
  try {
    const toiletTypeId = BigInt(4);

    const allLocations = await prisma.locations.findMany({
      where: { type_id: toiletTypeId },
      include: {
        hygiene_scores: {
          orderBy: { inspected_at: "desc" },
          take: 1,
          select: { score: true },
        },
      },
    });

    const allReviews = await prisma.review.findMany({
      where: {
        site_id: {
          in: allLocations.map((loc) => Number(loc.id)),
        },
      },
      select: {
        site_id: true,
        rating: true,
      },
    });

    // Group ratings by site_id
    const reviewsBySite = {};
    allReviews.forEach((r) => {
      if (!reviewsBySite[r.site_id]) reviewsBySite[r.site_id] = [];
      if (r.rating !== null) reviewsBySite[r.site_id].push(r.rating);
    });

    const result = allLocations.map((loc) => {
      const userRatings = reviewsBySite[Number(loc.id)] || [];

      const hygieneScore = loc.hygiene_scores[0]?.score ?? null;
      const hygieneRatingMapped =
        hygieneScore !== null
          ? hygieneScore >= 100
            ? 5
            : hygieneScore >= 80
            ? 4
            : hygieneScore >= 60
            ? 3
            : hygieneScore >= 40
            ? 2
            : 1
          : null;

      const allRatings = [
        ...userRatings,
        ...(hygieneRatingMapped !== null ? [hygieneRatingMapped] : []),
      ];
      const ratingCount = allRatings.length;
      const averageRating =
        ratingCount > 0
          ? allRatings.reduce((sum, r) => sum + r, 0) / ratingCount
          : null;

      return {
        ...loc,
        id: loc.id.toString(),
        parent_id: loc.parent_id?.toString() || null,
        company_id: loc.company_id?.toString() || null,
        type_id: loc.type_id?.toString() || null,
        averageRating,
        ratingCount,
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching toilet locations");
  }
};

export const getToiletById = async (req, res) => {
  try {
    // const locationId = BigInt(req.params.id);
    let locId = req.params.id;

    const location = await prisma.locations.findUnique({
      where: { id: Number(locId) },
      include: {
        hygiene_scores: {
          orderBy: { inspected_at: "desc" },
          take: 1,
          select: { score: true },
        },
      },
    });

    if (!location) {
      return res.status(404).json({ message: "Toilet not found" });
    }

    const reviews = await prisma.review.findMany({
      where: { site_id: Number(locId) },
    });

    const intReviews = reviews.map((item) => ({
      ...item,
      id: item.id.toString(),
      user_id: item.user_id.toString(),
    }));
    // console.log(reviews, "reviews");
    const userRatings = reviews.map((r) => r.rating).filter(Boolean);
    const hygieneScore = location.hygiene_scores[0]?.score ?? null;

    const hygieneRatingMapped =
      hygieneScore !== null
        ? hygieneScore >= 100
          ? 5
          : hygieneScore >= 80
          ? 4
          : hygieneScore >= 60
          ? 3
          : hygieneScore >= 40
          ? 2
          : 1
        : null;

    const allRatings = [
      ...userRatings,
      ...(hygieneRatingMapped !== null ? [hygieneRatingMapped] : []),
    ];
    const ratingCount = allRatings.length;
    const averageRating =
      ratingCount > 0
        ? allRatings.reduce((sum, r) => sum + r, 0) / ratingCount
        : null;

    const result = {
      ...location,
      id: location.id.toString(),
      parent_id: location.parent_id?.toString() || null,
      company_id: location.company_id?.toString() || null,
      type_id: location.type_id?.toString() || null,
      averageRating,
      ratingCount,
      ReviewData: intReviews,
    };

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching toilet by ID");
  }
};

// export const getZonesWithToilets = async (req, res) => {
//   try {
//     const ZONE_TYPE_ID = 8;    // zone
//     const TOILET_TYPE_ID = 4;  // toilet

//     // Fetch all zones
//     const zones = await prisma.locations.findMany({
//       where: { type_id: BigInt(ZONE_TYPE_ID) },
//       select: {
//         id: true,
//         name: true,
//         latitude: true,
//         longitude: true
//       }
//     });

//     // Get all toilets under all zones
//     const zoneIds = zones.map(z => z.id);

//     const toilets = await prisma.locations.findMany({
//       where: {
//         type_id: BigInt(TOILET_TYPE_ID),
//         parent_id: { in: zoneIds }
//       },
//       select: {
//         id: true,
//         name: true,
//         latitude: true,
//         longitude: true,
//         parent_id: true
//       }
//     });

//     // Group toilets under their parent zones
//     const toiletsByZone = {};
//     toilets.forEach((toilet) => {
//       const parentId = toilet.parent_id?.toString();
//       if (!toiletsByZone[parentId]) toiletsByZone[parentId] = [];
//       toiletsByZone[parentId].push({
//         id: toilet.id.toString(),
//         name: toilet.name,
//         latitude: toilet.latitude?.toString(),
//         longitude: toilet.longitude?.toString()
//       });
//     });

//     // Prepare final result
//     const result = zones.map((zone) => ({
//       id: zone.id.toString(),
//       name: zone.name,
//       latitude: zone.latitude?.toString(),
//       longitude: zone.longitude?.toString(),
//       children: toiletsByZone[zone.id.toString()] || []
//     }));

//     res.json(result);
//   } catch (err) {
//     console.error('Error fetching zones:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

export const getZonesWithToilets = async (req, res) => {
  try {
    // Fetch all zones (platforms or floors)
    const ZONE_TYPE_IDS = [BigInt(5), BigInt(7) , BigInt(2) , BigInt(3) , BigInt(6)]; // Platform & Floor

    const zones = await prisma.locations.findMany({
      where: {
        type_id: { in: ZONE_TYPE_IDS },
      },
      select: {
        id: true,
        name: true,
        type_id: true,
      },
    });

    console.log(zones, "zones");

    if (!zones.length) return res.json([]);

    // Get toilets whose parent is in those zones
    const zoneIds = zones.map((z) => z.id);
    console.log(zoneIds, "zones ids");

    const toilets = await prisma.locations.findMany({
      where: {
        type_id: BigInt(4), // Toilet
        parent_id: { in: zoneIds },
      },
      select: {
        id: true,
        name: true,
        parent_id: true,
        latitude: true,
        longitude: true,
        hygiene_scores: {
          orderBy: { inspected_at: "desc" },
          take: 1,
          select: { image_url: true },
        },
      },
    });

    console.log(toilets, "toilest ++ loc");
    // Group toilets by their zone (parent_id)
    const toiletsByZone = {};
    toilets.forEach((toilet) => {
      const zoneId = toilet.parent_id.toString();
      if (!toiletsByZone[zoneId]) toiletsByZone[zoneId] = [];

      // toiletsByZone[zoneId].push({
      //   id: toilet.id.toString(),
      //   name: toilet.name,
      //   image_url: toilet.hygiene_scores[0]?.image_url || null,
      // });

      toiletsByZone[zoneId].push({
        id: toilet.id.toString(),
        name: toilet.name,
        image_url: toilet.hygiene_scores[0]?.image_url || null,
        latitude: toilet.latitude,
        longitude: toilet.longitude,
      });
    });

    // Attach toilets to zones
    const result = zones.map((zone) => ({
      id: zone.id.toString(),
      name: zone.name,
      type_id: zone.type_id.toString(),
      children: toiletsByZone[zone.id.toString()] || [],
    }));

    return res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching zones and toilets" });
  }
};
