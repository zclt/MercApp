import { Component } from '@angular/core';
import { CheckoutService } from './checkout.service';
import {ItemInfo} from './model/item-info'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title: string = "Mercado"
  valor: string = "0" 
  valorReal: number = 0 
  sum: number = 0
  count: number = 0
  multi: boolean = false
  showFiller: boolean = false
  items: ItemInfo[] = []

  constructor(private checkoutService: CheckoutService) { 
    let obj = <string>localStorage.getItem("CartItems");
    if(obj) {
      this.items = <ItemInfo[]>JSON.parse(obj)
      this.sumItem()
    }
  }

  setCheckouItem(): void {
    let v = this.valorReal
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

  removeAll(): void {
    this.items = [];
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

    localStorage.setItem("CartItems", JSON.stringify(this.items));
  }

  getItems(): ItemInfo[] {
    return this.items
  }

  concatValor(v: string): void {
    if(this.multi || v.length == 0) this.valor = '0'
    this.multi = false
    this.valor += v
    this.valorReal = parseFloat(this.valor) / 100
  }

  backspaceValor(): void {
    this.multi = false
    this.valor = this.valor.slice(0, -1)
    if(this.valor.length == 0) this.valor = '0'
    this.valorReal = parseFloat(this.valor) / 100
  }
}
