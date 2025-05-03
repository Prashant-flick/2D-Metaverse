import { Router } from "express";
import { addElementSchema, createMeetingSchema, createSpaceSchema } from "../../types";
import client from "@repo/db/client"
import { userMiddleware } from "../../middleware/user";
import { sendEmail } from "../../lib/email";

export const spaceRouter = Router();
spaceRouter.use(userMiddleware)

spaceRouter.get("/all", async (req, res) => {
  try {
    const spaceRes = await client.space.findMany({
      where: {
        creatorId: req.userId as string
      }
    })

    res.status(200).json({
      spaces: spaceRes.map(e => ({
        id: e.id,
        name: e.name,
        dimensions: e.dimensions,
        thumbnail: e.thumbnail
      }))
    })
  } catch (error) {
    res.status(400).json({
      message: "fetching user spaces failed"
    })
  }
})

spaceRouter.get("/recentSpaces", async (req, res) => {
  try {
    const recentJoinedSpaceRes = await client.spaceJoinedUsers.findMany({
      where: {
        userId: req.userId
      },
      select: {
        spaceId: true,
        date: true
      },
      orderBy: {
        date: 'desc'
      }
    })

    const spaceIds = recentJoinedSpaceRes.map(item => item.spaceId);

    const spaceRes = await client.space.findMany({
      where: {
        id: {
          in: spaceIds
        }
      },
    })

    res.status(200).json({
      message: "space fetching success",
      spaces: spaceRes.map(e => ({
        id: e.id,
        name: e.name,
        dimensions: e.dimensions,
        thumbnail: e.thumbnail
      }))
    })
  } catch (error) {
    res.status(400)
      .json({
        message: "fetching spaceIds failed"
      })
  }
})

spaceRouter.get("/:spaceId", async (req, res) => {
  const spaceId = req.params.spaceId as string;

  try {
    const space = await client.space.findFirst({
      where: {
        id: spaceId
      },
      select: {
        id: true,
        name: true,
        dimensions: true,
        spaceElements: true
      }
    })

    const spaceRes = {
      id: space?.id,
      name: space?.name,
      dimensions: space?.dimensions,
      elements: space?.spaceElements.map(e => ({
        id: e.id,
        elementId: e.elementId,
        x: e.x,
        y: e.y,
        name: ''
      }))
    }

    spaceRes.elements?.map(async (elem) => {
      const elemRes = await client.element.findFirst({
        where: {
          id: elem.elementId
        }
      })
      return {
        ...elem,
        name: elemRes?.name
      }
    })

    res.status(200).json({
      message: "space fetching success",
      spaceRes
    })
  } catch (error) {
    res.status(400).json({ message: "failed to get space" });
  }
})

spaceRouter.post("/element", async (req, res) => {
  const parsedData = addElementSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.status(400).json({ message: "type validation failed" });
    return;
  }

  try {
    const spaceRes = await client.space.findUnique({
      where: {
        id: parsedData.data.spaceId
      }
    })

    const spaceX = Number(spaceRes?.dimensions?.split("x")[0]);
    const spaceY = Number(spaceRes?.dimensions?.split("x")[1]);
    if (spaceX < parsedData.data.x || spaceY < parsedData.data.y || 1 > parsedData.data.x || 1 > parsedData.data.y) {
      res.status(400).json({ message: "boundry limit exceeded" });
      return;
    }

    const spaceElemRes = await client.spaceElements.create({
      data: {
        elementId: parsedData.data.elementId,
        spaceId: parsedData.data.spaceId,
        x: parsedData.data.x,
        y: parsedData.data.y,
      }
    })

    res.status(200).json({
      id: spaceElemRes.id
    })
  } catch (error) {
    res.status(400).json({ message: "spaceElement creation failed" });
  }
})

spaceRouter.post("/", async (req, res) => {
  const parsedData = createSpaceSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({
      message: "type validation failed"
    })
    return
  }

  if (!parsedData.data.mapId && !parsedData.data.dimensions) {
    res.status(400).json({ message: "either mapId or dimensions needed" })
    return
  }

  try {
    if (parsedData.data.mapId) {
      const mapRes = await client.map.findUnique({
        where: {
          id: parsedData.data.mapId
        },
        select: {
          elements: true,
          thumbnail: true,
          dimensions: true
        }
      })

      if (mapRes?.thumbnail && mapRes.elements) {
        const spaceRes = await client.$transaction(async (transactionClient) => {
          const space = await transactionClient.space.create({
            data: {
              name: parsedData.data.name,
              mapId: parsedData.data.mapId,
              creatorId: req.userId,
              thumbnail: mapRes?.thumbnail as string,
              dimensions: mapRes.dimensions,
            },
          });

          await transactionClient.spaceJoinedUsers.create({
            data: {
              spaceId: space.id,
              userId: req.userId,
              date: new Date()
            }
          })

          await transactionClient.spaceElements.createMany({
            data: mapRes?.elements.map((m) => ({
              elementId: m.elementId,
              spaceId: space.id,
              x: m.x,
              y: m.y,
            })),
          });

          return space;
        });

        res.status(200).json({
          id: spaceRes.id
        })
      }
    } else {
      const spaceRes = await client.$transaction(async (tx) => {
        const spaceRes = await tx.space.create({
          data: {
            name: parsedData.data.name,
            dimensions: parsedData.data.dimensions,
            creatorId: req.userId,
            thumbnail: parsedData.data.thumbnail || '',
          }
        })

        await tx.spaceJoinedUsers.create({
          data: {
            spaceId: spaceRes.id,
            userId: req.userId,
            date: new Date()
          }
        })
        return spaceRes;
      })

      res.status(200).json({
        id: spaceRes.id
      })
    }
  } catch (error) {
    res.status(400).json({ message: "space creation failed" })
  }
})

spaceRouter.post("/spaceJoined/:spaceId", async (req, res) => {
  const spaceId = req.params.spaceId;
  if (!spaceId) {
    res.status(400)
      .json({
        message: "spaceId is required"
      })
    return;
  }

  try {
    const spaceJoinedRes = await client.spaceJoinedUsers.findFirst({
      where: {
        spaceId,
        userId: req.userId
      }
    })


    const date = new Date();
    if (spaceJoinedRes) {
      await client.spaceJoinedUsers.update({
        where: {
          id: spaceJoinedRes.id
        },
        data: {
          date
        }
      })
    } else {
      await client.spaceJoinedUsers.create({
        data: {
          spaceId,
          userId: req.userId,
          date
        }
      })
    }
    res.status(200)
      .json({
        message: "user joined space success"
      })
  } catch (error) {
    res.status(400)
      .json({
        message: "spaceJoined Creation failed"
      })
  }
})

spaceRouter.post("/createMeeting", async (req, res) => {
  const parsedData = createMeetingSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400)
      .json({
        message: "validation failed"
      })
    return;
  }

  try {
    const meetingDate = new Date(`${parsedData.data.date}T${parsedData.data.time}`);
    const meetingRes = await client.meeting.create({
      data: {
        name: parsedData.data.name,
        spaceId: parsedData.data.spaceId,
        ownerId: req.userId,
        date: meetingDate
      }
    })

    const formattedDate = meetingDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = meetingDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const spaceUsers = await client.spaceJoinedUsers.findMany({
      where: {
        spaceId: parsedData.data.spaceId
      },
      include: {
        user: true
      }
    })

    const spaceUrl = `http://localhost:5173/app/space/${parsedData.data.spaceId}?meeting=true`
    const emailPromises = spaceUsers.map(async (spaceUser) => {
      const { email, username } = spaceUser.user;

      const emailContent = {
        to: email,
        subject: `Meeting Scheduled: ${username}`,
        html: `
          <h2>Meeting Invitation</h2>
          <p>Hello ${username || 'there'},</p>
          <p>A new meeting has been scheduled in your workspace.</p>
          <div style="margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
            <p><strong>Meeting Name:</strong> ${username}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${formattedTime}</p>
          </div>
          <p>Please join the meeting by clicking the link below:</p>
          <p><a href="${spaceUrl}" style="padding: 10px 15px; background-color: #4a5568; color: white; text-decoration: none; border-radius: 5px;">Join Meeting</a></p>
          <p>Or copy and paste this URL into your browser:</p>
          <p>${spaceUrl}</p>
          <p>Thank you!</p>
        `,
      };

      return sendEmail(emailContent);
    });

    res.status(200)
      .json({
        message: "meeting creation success",
        id: meetingRes.id
      })
  } catch (error) {
    res.status(400)
      .json({
        message: "meeting creation failed"
      })
  }
})

spaceRouter.delete("/:spaceId", async (req, res) => {
  const spaceId = req.params.spaceId as string;

  try {
    const spaceRes = await client.space.findUnique({
      where: {
        id: spaceId
      }
    })

    if (!spaceRes) {
      res.status(400).json({
        message: "space doesn't exist"
      })
      return;
    }

    if (spaceRes?.creatorId !== req.userId) {
      res.status(403).json({ message: "user is unauthenticated to delete some other space" })
      return
    }

    await client.$transaction(async (transactionClient) => {
      await transactionClient.spaceElements.deleteMany({
        where: {
          spaceId,
        },
      });

      await transactionClient.space.delete({
        where: {
          id: spaceId,
        },
      });
    });

    res.status(200).json({
      message: "space deletion success"
    })
  } catch (error) {
    res.status(400).json({ message: "space deletion failed" });
  }
})

spaceRouter.delete("/element/:elementId", async (req, res) => {
  const spaceElemId = req.params.elementId;

  try {
    await client.spaceElements.delete({
      where: {
        id: spaceElemId
      }
    })

    res.status(200).json({
      message: "deletion success"
    })
  } catch (error) {
    res.status(400).json({ message: "deletion of space element failed" });
  }
})



