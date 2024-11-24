import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { MenubarModule } from 'primeng/menubar';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { PanelModule } from 'primeng/panel';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { InputSwitchModule } from 'primeng/inputswitch';

const modules = [
  FormsModule,
  ButtonModule,
  InputTextModule,
  CardModule,
  MenubarModule,
  TableModule,
  DialogModule,
  ToastModule,
  DropdownModule,
  PanelModule,
  CalendarModule,
  CheckboxModule,
  RadioButtonModule,
  MessageModule,
  MessagesModule,
  InputSwitchModule
];

@NgModule({
  imports: modules,
  exports: modules
})
export class PrimeNgModule { }
