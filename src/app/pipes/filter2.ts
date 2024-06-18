import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "tablefilter",
  standalone: true,
})
export class FilterPipe2 implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items) return [];
    if (!searchText) return items;
    searchText = searchText.toLowerCase();
    return items.filter((it) => {
      return it.name.toLowerCase().includes(searchText);
    });
  }
}
