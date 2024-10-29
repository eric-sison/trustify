import * as React from "react";
import { CheckIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import { Column } from "@tanstack/react-table";
import { cn } from "@trustify/utils/shadcn";
import { useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../Popover";
import { Button } from "../Button";
import { Separator } from "../Separator";
import { Badge } from "../Badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../Command";

interface DataTableFacetedFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
  title?: string;
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues();
  const selectedValues = new Set(column?.getFilterValue() as string[]);

  const sortedList = useMemo(() => Array.from(column.getFacetedUniqueValues().keys()).sort(), [column]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-10 border-dashed">
          <PlusCircledIcon className="mr-2 h-4 w-4" />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  sortedList
                    .filter((list) => selectedValues.has(list))
                    .map((mappedList, index) => (
                      <Badge variant="secondary" key={index} className="rounded-sm px-1 font-normal">
                        {mappedList}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command>
          <CommandInput disabled={sortedList.length === 0} placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {sortedList.length === 0 ? (
                <p className="p-2 text-sm text-muted-foreground">No data</p>
              ) : (
                sortedList.map((list, index) => {
                  const isSelected = selectedValues.has(list);
                  return (
                    <CommandItem
                      key={index}
                      onSelect={() => {
                        isSelected ? selectedValues.delete(list) : selectedValues.add(list);

                        const filterValues = Array.from(selectedValues);

                        column?.setFilterValue(filterValues.length ? filterValues : undefined);
                      }}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible",
                        )}
                      >
                        <CheckIcon className={cn("h-4 w-4")} />
                      </div>
                      {/* {option.icon && <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />} */}
                      <span>{list}</span>
                      {facets?.get(list) && (
                        <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                          {facets.get(list)}
                        </span>
                      )}
                    </CommandItem>
                  );
                })
              )}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
