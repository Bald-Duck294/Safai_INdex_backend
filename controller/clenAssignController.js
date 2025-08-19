import prisma from "../config/prismaClient.mjs";
import { serializeBigInt } from "../utils/serializer.js";

/**
 * GET all cleaner assignments
 */
export const getAllAssignments = async (req, res) => {
  try {
    const assignments = await prisma.cleaner_assignments.findMany({
      include: { locations: true },
      orderBy: { id: "asc" },
    });
    res.status(200).json({
      status: "success",
      message: "Assignments retrieved successfully.",
      data: serializeBigInt(assignments),
    });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

/**
 * GET single assignment by id
 */
// export const getAssignmentById = async (req, res) => {


//   try {
//     const id = parseInt(req.params.id);
//     if (isNaN(id)) {
//       return res.status(400).json({ status: "error", message: "Invalid ID provided." });
//     }


//     console.log(id , "id")

//     const assignment = await prisma.cleaner_assignments.findMany({
//       where: { cleaner_user_id : id},
//       include: { locations: true },
//     });

//     if (!assignment) {
//       return res.status(404).json({ status: "error", message: "Assignment not found." });
//     }

//     res.status(200).json({
//       status: "success",
//       message: "Assignment retrieved successfully.",
//       data: serializeBigInt(assignment), // Corrected from 'assignments' to 'assignment'
//     });
//   } catch (error) {
//     console.error("Error fetching assignment:", error);
//     res.status(500).json({ status: "error", message: "Internal Server Error" });
//   }
// };



/**
 * GET assignments by cleaner_user_id
 */
export const getAssignmentByCleanerUserId = async (req, res) => {
  try {
    const cleanerUserId = parseInt(req.params.id);
    if (isNaN(cleanerUserId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid cleaner_user_id provided."
      });
    }

    console.log(cleanerUserId, "cleaner_user_id");

    const assignments = await prisma.cleaner_assignments.findMany({
      where: { cleaner_user_id: cleanerUserId },
      include: { locations: true },
      orderBy: { id: "asc" }
    });

    console.log(assignments.length , assignments.length === 0 )
    if (assignments.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "Query ran successfully but no assignments found.",
        data: []
      });
    }

    res.status(200).json({
      status: "success",
      message: "Assignments retrieved successfully.",
      data: serializeBigInt(assignments)
    });

  } catch (error) {
    console.error("Error fetching assignments by cleaner_user_id:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};


/**
 * CREATE new assignment
 */
export const createAssignment = async (req, res) => {
  try {
    const { name, cleaner_user_id, company_id, type_id, location_id, status } =
      req.body;
    
    // Basic validation
    if (!name || !cleaner_user_id || !company_id) {
        return res.status(400).json({ status: "error", message: "Missing required fields: name, cleaner_user_id, company_id." });
    }

    const newAssignment = await prisma.cleaner_assignments.create({
      data: {
        name,
        cleaner_user_id: parseInt(cleaner_user_id),
        company_id: parseInt(company_id),
        type_id: type_id ? parseInt(type_id) : null,
        location_id: location_id ? parseInt(location_id) : null,
        status: status || "unassigned",
      },
    });

    res.status(201).json({
        status: "success",
        message: "Assignment created successfully.",
        data: serializeBigInt(newAssignment),
    });
  } catch (error) {
    console.error("Error creating assignment:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

/**
 * UPDATE assignment by id
 */
export const updateAssignment = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ status: "error", message: "Invalid ID provided." });
    }

    const { name, cleaner_user_id, company_id, type_id, location_id, status } =
      req.body;

    const updatedAssignment = await prisma.cleaner_assignments.update({
      where: { id },
      data: {
        name,
        cleaner_user_id: cleaner_user_id
          ? parseInt(cleaner_user_id)
          : undefined,
        company_id: company_id ? parseInt(company_id) : undefined,
        type_id: type_id ? parseInt(type_id) : undefined,
        location_id: location_id ? parseInt(location_id) : undefined,
        status,
        updated_at: new Date(),
      },
    });

    res.status(200).json({
        status: "success",
        message: "Assignment updated successfully.",
        data: serializeBigInt(updatedAssignment),
    });
  } catch (error) {
    // Handle cases where the record to update doesn't exist
    if (error.code === 'P2025') {
        return res.status(404).json({ status: "error", message: "Assignment not found." });
    }
    console.error("Error updating assignment:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

/**
 * DELETE assignment by id
 */
export const deleteAssignment = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ status: "error", message: "Invalid ID provided." });
    }

    await prisma.cleaner_assignments.delete({
      where: { id },
    });

    res.status(200).json({ status: "success", message: "Assignment deleted successfully." });
  } catch (error) {
     // Handle cases where the record to delete doesn't exist
    if (error.code === 'P2025') {
        return res.status(404).json({ status: "error", message: "Assignment not found." });
    }
    console.error("Error deleting assignment:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};
