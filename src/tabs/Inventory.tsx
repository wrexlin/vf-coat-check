import { Component, createSignal } from "solid-js";
import { TicketColors, useItems, useDays } from "../api";
import ItemTable from "../components/item_table";
import ColorSelect from "../components/color_select";

const Inventory: Component = () => {
   const days = useDays();

   const [uid, setUID] = createSignal<string | null>(null);
   const [ticketId, setTicketId] = createSignal<string | null>(null);
   const [dayFilter, setDayFilter] = createSignal<string | null>(null);
   const [colorFilter, setColorFilter] = createSignal<TicketColors | null>(null);
   const [returnedFilter, setReturnedFilter] = createSignal<boolean | null>(null);
   const items = useItems(colorFilter, uid, ticketId, true, dayFilter, returnedFilter);

   // const are_items_limited = () => totalCount() > items().length;
   const are_items_limited = () => false;

   return <>
      <h3>Filters</h3>
      <div style={{ display: "flex", "flex-direction": "column", gap: "1rem", "margin-bottom": "2rem" }}>
         <label>
            Badge ID
            <input type="number" pattern="[0-9]*" value={uid() ?? ""} onInput={(evt) => setUID((evt.target as HTMLInputElement).value)} />
         </label>
         <label>
            Ticket ID
            <input type="number" pattern="[A-Z]?[0-9]*" value={ticketId() ?? ""} onInput={(evt) => setTicketId((evt.target as HTMLInputElement).value)} />
         </label>

         <label>
            Day
            <select value={dayFilter() ?? ""} onChange={(evt) => setDayFilter(evt.target.value)}>
               <option value={""}>All days</option>
               {days.records.map((day) => <option value={day.id}>{day.name}</option>)}
            </select>
         </label>

         <label>
            Returned
            <select value={dayFilter() ?? ""} onChange={(evt) => {
               if (evt.target.value == "") setReturnedFilter(null)
               else setReturnedFilter(evt.target.value == "true")
            }}>
               <option value={""}>All</option>
               <option value={"true"}>Yes</option>
               <option value={"false"}>No</option>
            </select>
         </label>

         <ColorSelect value={colorFilter()} onChange={setColorFilter} />
         <button class="btn btn-error" onClick={() => {
            setUID(null);
            setTicketId(null);
            setColorFilter(null);
            setDayFilter(null);
            setReturnedFilter(null);
         }}>Clear filter</button>
      </div>

      <div class="progress-bar progress-bar-no-arrow">
         <div class={"progress-bar-filled " + (items.loading ? "loading" : "full")} />
      </div>

      <h3>Items</h3>
      {/* {are_items_limited() && <div class="terminal-alert terminal-alert-warning">Items are limited to {items.records.length} (total {totalCount()})</div>} */}
      <ItemTable items={items.records} allow_checkout />
   </>
}

export default Inventory;