import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductRoutingModule } from './product-routing.module';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@NgModule({
  declarations: [ProductListComponent],
  imports: [CommonModule, ProductRoutingModule, ReactiveFormsModule, FormsModule]
})
export class ProductModule {}
