import { createSignal } from "solid-js";
import { Item, ItemExp, pb } from "../api";
import { TICKET_COLORS } from "../tabs/shared";

export default function ItemTable(props: { items: (Item | ItemExp)[], allow_checkout?: boolean }) {
   const [error, setError] = createSignal<string | null>(null)
   const checkout = (item: Item) => {
      console.log("Checking out", item)
      setError(null)
      pb.collection("items").update(item.id, { returned_at: new Date().toISOString() }).then(() => { }).catch((err) => {
         console.error(err)
         setError(err.message)
      })
   }

   return <>
      {error() && <div class="terminal-alert terminal-alert-error">{error()}</div>}
      <table>
         <thead>
            <tr>
               <th>UID</th>
               <th>Ticket ID</th>
               <th>Day</th>
               <th>Returned</th>
               <th>Returned At</th>
               {props.allow_checkout && <th style={{ width: "12ch" }}>Actions</th>}
            </tr>
         </thead>
         <tbody>
            {props.items.map((item) => <tr>
               <td>{item.uid}</td>
               <td><ColorBox color={item.ticket_color} /> {item.ticket_id}</td>
               <td>{(item as ItemExp).expand?.day.name ?? ""}</td>
               <td>{item.returned_at ? "Yes" : "No"}</td>
               <td>{item.returned_at ? item.returned_at.toLocaleString() : ""}</td>
               {props.allow_checkout && <td>
                  {(!item.returned_at) && <button class="btn btn-primary btn-ghost" style={{
                     padding: "2px 6px 2px 6px ",
                     width: "100%"
                  }} onClick={() => checkout(item)}>Check Out</button>}
               </td>}
            </tr>)}
         </tbody>
      </table>
   </>
}
const ColorBox = (props: { color: string }) => <div style={{
   width: "1em",
   height: "1em",
   "background": TICKET_COLORS[props.color as any] ?? "black",
   display: "inline-block",
   "vertical-align": "middle",
}}></div>

// {item.ticket_color} {"->"}