import { Component, createEffect, createSelector, createSignal, useContext } from "solid-js";
import { DayContext } from "./shared";
import { pb, useDaypasses, useUIDLookup, useWeekpasses } from "../api";

// TODO: Show error message


const Passes: Component = () => {
   const day = useContext(DayContext)!;
   const [uid, setUID] = createSignal("");
   const [error, setError] = createSignal("");
   const [showOk, setShowOk] = createSignal(false);

   const daypasses = useDaypasses(day()!);
   const weekpasses = useWeekpasses();

   // const uid_info = useUIDLookup(uid, () => day()!);
   const uid_info = useUIDLookup(uid);

   const alreadyHasPass = () => uid_info.daypasses.records.length > 0 || uid_info.weekpasses.records.length > 0;
   const disallowDaypass = () => alreadyHasPass();
   const disallowWeekpass = () => uid_info.weekpasses.records.length > 0;

   createEffect(() => {
      if (uid()) {
         setShowOk(false);
      }
   })

   const createDaypass = () => {
      if (disallowDaypass()) {
         setError("User already has a pass");
         return;
      }
      setShowOk(false);
      pb.collection("day_passes").create({
         uid: uid(),
         day: day()?.id
      }).then(() => {
         setUID("");
         setShowOk(true);
         input_ref.focus();
      }).catch((e) => {
         setError(e.message);
         console.error(e, e.uid);
      })
   }

   const createWeekpass = (staff: boolean) => {
      if (disallowWeekpass()) {
         setError("User already has a weekpass");
         return;
      }
      setShowOk(false);
      pb.collection("week_passes").create({
         uid: uid(),
         staff
      }).then(() => {
         setUID("");
         setShowOk(true);
         input_ref.focus();
      }).catch((e) => {
         setError(e.message);
         setShowOk(false);
         console.error(e, e.uid);
      })
   }

   let input_ref: HTMLInputElement;

   return <>
      <div class="form-group">
         <label>
            Badge ID
            <input ref={elm => {
               input_ref = elm;
            }} style={{ "border-color": uid_info.loading() ? "unset" : "green" }} type="number" pattern="[0-9]*" value={uid()} onInput={(evt) => setUID((evt.target as HTMLInputElement).value)} />
         </label>
      </div>

      {showOk() && <div class="terminal-alert terminal-alert-success">
         Pass created!
      </div>}

      {/* TODO: Make this message better! */}
      {alreadyHasPass() && <div class="terminal-alert terminal-alert-error">
         User already has a weekpass or a daypass for today!
      </div>}

      <table>
         <thead>
            <tr>
               <th>Type</th>
               <th>Day</th>
               <th>Created</th>
            </tr>
         </thead>
         <tbody>
            {uid_info.daypasses.records.map((pass) => <tr>
               <td>Daypass</td>
               <td>{pass.expand.day.name}</td>
               <td>{pass.created.toLocaleString()}</td>
            </tr>)}
            {uid_info.weekpasses.records.map((pass) => <tr>
               <td>Weekpass</td>
               <td></td>
               <td>{pass.created.toLocaleString()}</td>
            </tr>)}
         </tbody>
      </table>

      <div class="form-group">
         <button disabled={uid() == "" || disallowDaypass()} class="btn btn-default" onClick={createDaypass}>Create Daypass</button>

         <button style={{ "margin-left": "2rem" }} disabled={uid() == "" || disallowWeekpass()} class="btn btn-default" onClick={() => createWeekpass(false)}>Create Weekpass</button>
         <button style={{ "margin-left": "2rem" }} disabled={uid() == "" || disallowWeekpass()} class="btn btn-default" onClick={() => createWeekpass(true)}>Create Staffpass</button>
      </div>

      {error() && <div class="terminal-alert terminal-alert-error">{error()}</div>}

      <h2>Daypasss today</h2>
      <table>
         <thead>
            <tr>
               <th>UID</th>
               <th>Day</th>
               <th>Bought at</th>
            </tr>
         </thead>
         <tbody>
            {daypasses.records.map((daypass) => <tr>
               <td>{daypass.uid}</td>
               <td>{daypass.expand.day.name}</td>
               <td>{daypass.created.toLocaleString()}</td>
            </tr>)}
         </tbody>
      </table>

      <h2>Weekpasses</h2>
      <table>
         <thead>
            <tr>
               <th>UID</th>
               <th>Bought at</th>
               <th>Staff</th>
            </tr>
         </thead>
         <tbody>
            {weekpasses.records.map((weekpass) => <tr>
               <td>{weekpass.uid}</td>
               <td>{weekpass.created.toLocaleString()}</td>
               <td>{weekpass.staff ? "Staff" : "Regular"}</td>
            </tr>)}
         </tbody>
      </table>
   </>
}

export default Passes;