import { Component } from "solid-js";
import { TICKET_COLORS } from "../tabs/shared";
import { TicketColors } from "../api";

const ColorSelect: Component<{ value: TicketColors | null, onChange: (color: TicketColors) => void }> = (props) => {
   return <div style={{ display: "flex", gap: "1rem" }}>
      {Object
         .entries(TICKET_COLORS)
         .map(([key, value]) => <div
            onClick={() => props.onChange(key as any)}
            class="color-select-box"
            style={{
               "background": value,
               "border-color": props.value == key ? "#229900" : "gray"
            }}>
         </div>
         )}
   </div>
}

export default ColorSelect;