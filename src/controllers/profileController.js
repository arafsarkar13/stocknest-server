import { profileService } from "../services/profileService.js";
import asyncHandler from "../utils/asyncHandler.js";

// every handler uses req.user from the verified token, never an id from the request body
export const getProfile = asyncHandler(async (req, res) => {
  res.json(await profileService.getProfile(req.user));
});

export const submitChange = asyncHandler(async (req, res) => {
  res.status(201).json(await profileService.submitChange(req.user, req.body));
});

export const cancelChange = asyncHandler(async (req, res) => {
  await profileService.cancelChange(req.user);
  res.json({ message: "Request withdrawn" });
});

export const changePassword = asyncHandler(async (req, res) => {
  res.json(await profileService.changePassword(req.user, req.body));
});

// ----- admin -----
export const listRequests = asyncHandler(async (req, res) => {
  res.json(await profileService.listRequests(req.query));
});

export const approveRequest = asyncHandler(async (req, res) => {
  res.json(
    await profileService.approve(req.params.id, req.user, req.body.note || ""),
  );
});

export const rejectRequest = asyncHandler(async (req, res) => {
  res.json(
    await profileService.reject(req.params.id, req.user, req.body.note || ""),
  );
});
