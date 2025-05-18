import { Component, createEffect, createSignal } from "solid-js";
import { Day, DayPass, Item, pb, useUIDLookup } from "../api";
import * as pbf from "@nedpals/pbf";
import ItemTable from "../components/item_table";

const LookupUID: Component = (props) => {
   const [uid, setUID] = createSignal("");
   const [error, setError] = createSignal("");

   const { loading, items, daypasses, weekpasses } = useUIDLookup(uid);

   return <>
      <div class="form-group">
         <label>
            Badge ID
            <input style={{ "border-color": loading() ? "unset" : "green" }} type="number" pattern="[0-9]*" value={uid()} onInput={(evt) => setUID((evt.target as HTMLInputElement).value)} />
         </label>
      </div>

      <div>
         <h3>Daypasses</h3>
         <table>
            <thead>
               <tr>
                  <th>Daypass ID</th>
                  <th>Day</th>
                  <th>Bought at</th>
               </tr>
            </thead>
            <tbody>
               {daypasses.records.map((daypass) => <tr>
                  <td>{daypass.id}</td>
                  <td>{daypass.expand.day.name}</td>
                  <td>{daypass.created.toLocaleString()}</td>
               </tr>)}
            </tbody>
         </table>
      </div>

      <div>
         <h3>Weekpasses</h3>
         <table>
            <thead>
               <tr>
                  <th>Weekpass ID</th>
                  <th>Bought at</th>
                  <th>Staff</th>
               </tr>
            </thead>
            <tbody>
               {weekpasses.records.map((weekpass) => <tr>
                  <td>{weekpass.id}</td>
                  <td>{weekpass.created.toLocaleString()}</td>
                  <td>{weekpass.staff ? "Staff" : "Regular"}</td>
               </tr>)}
            </tbody>
         </table>
      </div>


      <div>
         <h3>Items</h3>
         <ItemTable items={items.records} allow_checkout />
      </div>

      {error() && <div class="terminal-alert terminal-alert-error">{error()}</div>}
   </>
}

export default LookupUID;