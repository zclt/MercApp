import { Component } from '@angular/core'
import { CheckoutService } from './checkout.service'
import { ItemInfo } from './model/item-info'
import { ItemTodo } from './model/item-todo'
import { MatDialog } from '@angular/material/dialog'
import { AddItemComponent } from './add-item/add-item.component'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title: string = "Mercado"
  nome: string = ""
  valor: string = "0"
  valorReal: number = 0
  sum: number = 0
  count: number = 0
  multi: boolean = false
  showFiller: boolean = false
  items: ItemInfo[] = []
  itemsTodo: ItemTodo[] = []

  constructor(private checkoutService: CheckoutService, public dialog: MatDialog) {
    let obj = <string>localStorage.getItem("CartItems");
    if (obj) {
      this.items = <ItemInfo[]>JSON.parse(obj)
      this.sumItem()
    }
  }

  setCheckouItem(): void {
    let v = this.valorReal
    if (!(v > 0)) return

    let item: ItemInfo

    if (this.multi) {
      item = this.items[0]
      this.items.splice(0, 1)
      if (item) item.count++
    } else {
      item = new ItemInfo(v, 1, this.nome)
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

  addCheckouItem(item: ItemInfo): void {
    item.count++;
    this.sumItem()
  }

  reduceCheckouItem(item: ItemInfo, index: number): void {
    item.count--;
    if (item.count > 0)
      this.sumItem()
    else
      this.removeCheckouItem(index)
  }

  resetAll(): void {
    this.items = []
    this.concatValor('')
    this.sumItem()
    this.uncheckItemsTodo()
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
    if (this.multi || v.length == 0) {
      this.valor = '0'
      this.nome = ''
    }
    this.multi = false
    this.valor += v
    this.valorReal = parseFloat(this.valor) / 100
  }

  backspaceValor(): void {
    this.multi = false
    this.valor = this.valor.slice(0, -1)
    if (this.valor.length == 0) this.valor = '0'
    this.valorReal = parseFloat(this.valor) / 100
  }

  checkItem(item: ItemTodo): void {
    item.checked = true
    this.nome = item.nome
  }

  resetItemsTodo(): void {
    this.itemsTodo = []
  }

  uncheckItemsTodo(): void {
    this.itemsTodo.forEach(i => i.checked = false)
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AddItemComponent, {
      width: '250px',
      data: { nome: '' },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result)
        this.itemsTodo.unshift(new ItemTodo(result, false))
    });
  }
}