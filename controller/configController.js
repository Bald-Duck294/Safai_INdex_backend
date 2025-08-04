import prisma from "../config/prismaClient.mjs";

// '/api/configurations/:name'
// controller/configController.js

// Get configuration by Id
export async function getConfigurationById(req, res) {
  const { id } = req.params;
  console.log(id, "id from the ");

  if (!id) {
    return res
      .status(400)
      .json({ message: "Missing 'id' in request parameters." });
  }

  try {
    console.log(`Fetching configuration for ID: ${id}`);

    const config = await prisma.configurations.findUnique({
      where: {
        id: BigInt(id), // Ensure it's a BigInt if your DB uses it
      },
    });

    if (!config) {
      return res
        .status(404)
        .json({ message: `Configuration with id '${id}' not found.` });
    }

    const safeConfig = {
      ...config,
      id: config.id.toString(),
    };

    res.json(safeConfig);
  } catch (error) {
    console.error("Error fetching configuration:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

// get the cofiguration by name
export async function getConfigurationByName(req, res) {
  const { name } = req.params;
  console.log(name, "name from the request");

  if (!name) {
    return res
      .status(400)
      .json({ message: "Missing 'name' in request parameters." });
  }

  try {
    console.log(`Fetching configuration with name: ${name}`);

    const config = await prisma.configurations.findUnique({
      where: {
        name: name, // Use name directly (no BigInt!)
      },
    });


    if (!config) {
      return res
        .status(404)
        .json({ message: `Configuration with name '${name}' not found.` });
    }

    res.json({
        ...config,
        id:config?.id.toString()
    }); // name is already a string, no need for conversion
  } catch (error) {
    console.error("Error fetching configuration:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}
