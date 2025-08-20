import prisma from "../config/prismaClient.mjs";

import express from 'express';

export async function getUser(req, res) {
  try {

    const {companyId} = req.query;

    const users = await prisma.users.findMany({
        where:{
            company_id:1,
            role_id:"2"
        }
    });
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