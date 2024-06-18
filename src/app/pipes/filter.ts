import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "filter",
  standalone: true, // Add this property
})
export class FilterPipe implements PipeTransform {
  transform(
    items: any[],
    selectedItems: any[] | undefined,
    key: string,
  ): any[] {
    if (!selectedItems) {
      return items;
    }
    return items.filter(
      (item) =>
        !selectedItems.find((selectedItem) => selectedItem[key] === item[key]),
    );
  }
}
