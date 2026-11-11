import ApiError from "../utils/ApiError.js";

export const uploadService = {
  async uploadImage(buffer) {
    if (!process.env.IMGBB_API_KEY)
      throw new ApiError(500, "Image upload is not configured");

    const form = new FormData();
    form.append("image", buffer.toString("base64"));

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      {
        method: "POST",
        body: form,
      },
    );
    const result = await response.json();

    if (!response.ok || !result.success)
      throw new ApiError(502, "Image upload failed, please try again");
    return result.data.url;
  },
};
