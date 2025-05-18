import { Component, createSignal } from "solid-js"
import { useItems } from "../api";
import ItemTable from "../components/item_table";

const CheckOut: Component = () => {
   const [ticketId, setTicketId] = createSignal<string | null>("");

   const items = useItems(() => null, () => null, () => ticketId() || "---------------", false, () => null, () => null);

   return <>
      <label>
         Ticket ID
         <input style={{ "border-color": items.loading ? "unset" : "green" }} type="text" pattern="[A-Z]?[0-9]*" value={ticketId() ?? ""} onInput={(evt) => setTicketId((evt.target as HTMLInputElement).value)} />
      </label>

      <ItemTable items={items.records} allow_checkout />
   </>
}

export default CheckOut;