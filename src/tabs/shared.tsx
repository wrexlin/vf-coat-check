import { Accessor, createContext } from "solid-js";
import { Day } from "../api";
import type { Item } from "../api";

export const DayContext = createContext<Accessor<Day | undefined>>();
export const DAYPASS_LIMIT = 3;

export const TICKET_COLORS = {
   "pink": "pink",
   "blue": "linear-gradient(to right, #a4c6ff 50%, yellow 50% 100%)",
   "white": "lightgray",
} as { [key: string]: string }