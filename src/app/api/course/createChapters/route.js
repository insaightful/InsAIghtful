import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { strict_output } from "@/lib/gpt";
import { strict_response } from "@/lib/gpt2.0";
import { getUnsplashImage } from "@/lib/unsplash";
import { createChaptersSchema } from "@/validators/course";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(req, res) {
  const session = await getAuthSession();
  try {
    const body = await req.json();
    const { title, units } = createChaptersSchema.parse(body);

    let unitsPrompt = `Create a course about ${title}. The user has requested chapters for each of the units ${
      units.length > 0 ? `(only include these units: ${units})` : `(create at lesat 4 units or more if needed)`
    }. For each chapter, provide a detailed YouTube search query for an informative educational video.`;

    let output_units = await strict_response(
      "You are an AI capable of curating course content, coming up with relevant chapter titles, and finding relevant youtube videos for each chapter",
      new Array(unitsPrompt),
      {
        data: [
          {
            title: "title of the unit",
            chapters: [
              "an array of 3 chapters, each chapter should have a youtube_search_query key and a chapter_title key in the JSON object with proper syntax",
            ],
          },
        ],
      }
    );

    const imageSearchTerm = await strict_response(
      "You are an AI capable of finding the most relevant image for a course",
      `Please provide a good image search term for the title of a course about ${title}. This search term will be fed into the unsplash API, so make sure it is a good search term that will return good results.`,
      {
        image_search_term: "a good search term for the title of the course",
      }
    );

    const course_image = await getUnsplashImage(
      imageSearchTerm.image_search_term
    );

    const course = await prisma.course.create({
      data: {
        userId: session.user.id,
        name: title,
        image: course_image,
      },
    });

    for (const unit of output_units.data) {
      const title = unit.title;
      // using regex to remove things like "Unit 1: " from the title
      const regex = /Unit \d+: /;
      const unitTitle = title.replace(regex, "");
      const prismaUnit = await prisma.unit.create({
        data: {
          name: unitTitle,
          courseId: course.id,
        },
      });

      await prisma.chapter.createMany({
        data: unit.chapters.map((chapter) => {
          return {
            name: chapter.chapter_title,
            youtubeSearchQuery: chapter.youtube_search_query,
            unitId: prismaUnit.id,
          };
        }),
      });
    }

    return NextResponse.json({
      course_id: course.id,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return new NextResponse("invalid body", { status: 400 });
    } else {
      return new NextResponse(error, { status: 500 });
    }
  }
}
