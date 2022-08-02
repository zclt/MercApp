import { Component } from '@angular/core';
import { CheckoutService } from './checkout.service';
import {ItemInfo} from './model/item-info'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private checkoutService: CheckoutService) { }

  title: string = "Mercado"
  items: ItemInfo[] = [
    new ItemInfo(2.99, 1), 
    new ItemInfo(3.49, 1), 
    new ItemInfo(1.99, 3), 
    new ItemInfo(1.99, 3), 
    new ItemInfo(1.99, 3), 
    new ItemInfo(1.99, 3), 
    new ItemInfo(1.99, 3), 
    new ItemInfo(1.99, 3), 
    new ItemInfo(1.99, 3), 
    new ItemInfo(1.99, 3), 
    new ItemInfo(1.99, 3), 
    new ItemInfo(1.99, 3), 
    new ItemInfo(4.85, 2)
  ]  
  valor: string = ""  
  sum: number = 0
  count: number = 0
  multi: boolean = false
  keyboard: boolean = true

  setCheckouItem(i: string): void {
    if((i.length == 0)) return    
    let v = parseFloat(i)
    if(!(v > 0)) return

    let item: ItemInfo

    if(this.multi) {
      item = this.items[0]
      this.items.splice(0, 1)
      if(item) item.count++
    } else {
      item = new ItemInfo(v, 1)
      this.multi = true
    }

    this.items.unshift(item)
    this.multi = true
    this.sumItem()
  }

  removeCheckouItem(index: number): void {
    this.items.splice(index, 1)
    this.concatValor('')
    this.sumItem()
  }

  sumItem(): void {
    let s = 0
    let c = 0
    this.items.forEach(i => {
      s += (i.valor * i.count)
      c += i.count
    })
    this.sum = s
    this.count = c
  }

  getItems(): ItemInfo[] {
    return this.items
  }

  concatValor(v: string): void {
    if(this.multi) this.valor = ''
    this.multi = false

    if(v == '.' && this.valor.indexOf('.') >= 0) return
    this.valor += v
  }

  backspaceValor(): void {
    this.multi = false
    this.valor = this.valor.slice(0, -1)
  }
}
