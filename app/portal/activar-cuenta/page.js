"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "../../../lib/supabaseClient";

function getHashParams() {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.hash.replace(/^#/, ""));
}

function validatePassword(password) {
  if (password.length < 