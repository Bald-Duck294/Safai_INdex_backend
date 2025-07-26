import prisma from "../config/prismaClient.mjs";


// '/api/configurations/:name'
 export async function getConfiguration (req, res)  {

    console.log('in configuratinss');
    const { name } = req.params;
    console.log(`Fetching configuration for: ${name}`);

    try {
        let config = await prisma.configurations.findUnique({
            where: { name },
        });

        // If 'Toilet Features' is requested and doesn't exist, create and seed it.
        if (!config && name === 'Toilet Features') {
            console.log("'Toilet Features' configuration not found. Creating it now...");
            const toiletFeaturesDescription = [
                { key: "isHandicapAccessible", label: "Handicap Accessible", category: "Accessibility" },
                { key: "isStrictlyForHandicap", label: "Strictly for Handicap", category: "Accessibility" },
                { key: "isPaid", label: "Paid Entry", category: "Access" },
                { key: "requiresKey", label: "Requires Key", category: "Access" },
                { key: "accessType", label: "Access Type", category: "Access", type: "radio", options: ["Men", "Women", "Unisex"] },
                { key: "hasBabyChangingStation", label: "Baby Changing Station", category: "Features" },
                { key: "hasSanitaryProducts", label: "Sanitary Products Available", category: "Features" },
            ];

            config = await prisma.configurations.create({
                data: {
                    name: 'Toilet Features',
                    description: toiletFeaturesDescription,
                },
            });
            console.log("'Toilet Features' configuration created successfully.");
        }

        if (config) {
            // Ensure BigInts are converted to strings for JSON serialization
            const safeConfig = {
                ...config,
                id: config.id.toString(),
            };
            res.json(safeConfig);
        } else {
            res.status(404).json({ message: `Configuration with name '${name}' not found.` });
        }

    } catch (error) {
        console.error("Error fetching or creating configuration:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};