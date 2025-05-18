import { Show, createEffect, mergeProps, type Component } from "solid-js";
import { FieldPath, FieldStore, FieldValues } from "@modular-forms/solid";

export function TextInput<TFieldValues extends FieldValues, TFieldName extends FieldPath<TFieldValues>>(props: {
   field: FieldStore<TFieldValues, TFieldName>;
   props: any;
   // name: string;
   label: string;
   type?: string;
}) {
   // here we provide a default form control in case the user doesn't supply one
   return (
      <div class="form-group">
         <label>
            {props.label}
            <input name={props.field.name} type={props.type} {...props.props} />
            {props.field.error && <div style={{ color: "var(--error-color)" }}>{props.field.error}</div>}
         </label>
      </div>
   );
};