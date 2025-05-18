import { Component, createEffect, createSignal, useContext } from "solid-js";
import { DayContext, DAYPASS_LIMIT, TICKET_COLORS } from "./shared";
import { Item, pb, TicketColors, useItems, useUIDLookup } from "../api";
import * as pbf from "@nedpals/pbf";
import ColorSelect from "../components/color_select";


const CheckIn: Component = () => {
   const day = useContext(DayContext)!;
   const [uid, setUID] = createSignal("");
   const user = useUIDLookup(uid);

   const [ticketID, setTicketID] = createSignal("");
   const [ticketColor, setTicketColor] = createSignal<TicketColors | null>(null);
   // const [activeItems, setActiveItems] = createSignal(0);
   const [error, setError] = createSignal("");

   const hasDaypass = () => user.daypasses.records.find(e => e.day == day()?.id) ? "yes" : "no";
   const hasWeekpass = () => user.weekpasses.records.length > 0 ? "yes" : "no";
   const activeItems = () => user.items.records.filter(e => e.returned_at == null || e.returned_at == "").length;
   const exceedsDaypassLimit = () => (hasDaypass() == "yes" || hasWeekpass() == "yes") && activeItems() >= DAYPASS_LIMIT;

   createEffect(() => {
      console.log(activeItems());
   })


   const items = useItems(() => ticketColor() ?? "invalid" as any, () => null, () => ticketID() ?? "invalid", false, () => null, () => null);
   const ticket_used = () => ticketID() !== null && ticketColor() !== null && items.records.find(e => e.ticket_id == ticketID()) != null;

   const input_valid = () => uid() != "" && ticketID() != "" && ticketColor() != null;

   const dayWeekPassState = () => {
      if (user.loading()) {
         return "loading";
      }

      if (hasDaypass() == "yes" || hasWeekpass() == "yes") {
         return "success";
      }

      return "warning";
   }

   const createTicket = () => {
      if (!input_valid()) {
         setError("Invalid input");
         return
      }

      setError("");

      pb.collection("items").create({
         uid: uid(),
         ticket_id: ticketID(),
         ticket_color: ticketColor(),
         day: day()!.id,
         daypass: hasDaypass() == "yes",
      }).then(() => {
         setTicketID("");
         setTicketColor(null);
      }).catch((e) => {
         setError(e.message);
         console.error(e, e.uid);
      })
   }

   return <>
      <div class="form-group">
         <label>
            Badge ID
            <input type="number" pattern="[0-9]*" value={uid()} onInput={(evt) => setUID((evt.target as HTMLInputElement).value)} />
         </label>
      </div>
      <div style={{ "margin-top": "1rem", "display": "grid", "grid-template-columns": "1fr 1fr", gap: "1rem" }}>
         <div>
            {dayWeekPassState() == "loading" && <div class="terminal-alert terminal-alert-default">Loading</div>}
            {dayWeekPassState() == "success" && <div class="terminal-alert terminal-alert-success">Person has {hasWeekpass() == "yes" ? "weekpass" : "daypass"}!</div>}
            {dayWeekPassState() == "warning" && <div class="terminal-alert terminal-alert-warning">No daypass!</div>}
         </div>
         <div class="terminal-alert terminal-alert-default">Items today: {activeItems()}</div>
      </div>

      {exceedsDaypassLimit() && <div class="terminal-alert terminal-alert-error">
         Person has reached the daypass limit of {DAYPASS_LIMIT}. Additional items are required to be payed as Single-Item Passes!
      </div>}

      <div class="form-group">
         <label>
            Ticket Color
         </label>

         <ColorSelect value={ticketColor()} onChange={setTicketColor} />
      </div>

      <div class="form-group">
         <label>
            Ticket ID
            <input type="text" pattern='[A-Z]?[0-9]*' value={ticketID()} onInput={(evt) => setTicketID((evt.target as HTMLInputElement).value)} />
         </label>
      </div>

      {ticket_used() && <div class="terminal-alert terminal-alert-error">Ticket already used!</div>}

      <div class="form-group">
         <button disabled={!input_valid()} class="btn btn-default" onClick={createTicket}>Check-In</button>
      </div>

      {error() && <div class="terminal-alert terminal-alert-error">{error()} Ticket might already been registered!</div>}
   </>
}

export default CheckIn;