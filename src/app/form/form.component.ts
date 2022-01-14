import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { FormDataSourceService } from './form-data-source.service';
import { KPIElements } from './types/interface';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {

  buttonName: string | undefined;
  kpiData: any = [];
  dataFiltered: any = [];
  locationYear: any = [];

  // Form
  formTitle: string | undefined;
  displayedColumns: string[] | undefined;
  dataSource = new MatTableDataSource<KPIElements>();
  formGroup: FormGroup = new FormGroup({
    newDataValue: new FormControl('')
  });
  editingCell: number | undefined;

  constructor(private formDataSourceService: FormDataSourceService) { }

  ngOnInit(): void {
    this.formDataSourceService.getKPIData().subscribe(resp => {
      this.kpiData = resp;
      this.kpiData.forEach((item: any) => {
        item.newDataValue = item.kpiValue;
      });
      this.getFilter(resp);
      this.locationYear[0].class = 'active';
      this.formTitle = this.locationYear[0].locationName;
      this.dataFilter();
    });

    this.displayedColumns = ['domain', 'kpi', 'newData', 'existingData'];
  }

  getFilter(data: any) {
    // Get Location names and Year for the filter
    data.forEach((item: any) => {
      if (this.locationYear.find((newItem: any) => newItem.locationName === item.locationName) === undefined) {
        this.locationYear.push({ locationName: item.locationName, year: item.year, class: null });
      }
    });
  }

  dataFilter() {
    let actualData: any = [];
    // Clearing filtered data
    this.dataFiltered = [];

    // Filtering data
    this.kpiData.forEach((item: any) => {
      const activeFilter = this.locationYear.find((locItem: any) => locItem.class === 'active');
      if (item.locationName === activeFilter.locationName) {
        this.dataFiltered.push(item);
      }
    });

    // Checker for Actual and Calculated data
    this.dataFiltered.forEach((item: any, index: number) => {
      const kpiName = item.kpiName.split('/')[0];
      const prevItem = index !== 0 ? index - 1 : index;
      const nextItem = index + 1;

      if (
        prevItem !== index &&
        this.dataFiltered[prevItem] !== undefined &&
        this.dataFiltered[prevItem].kpiName.includes(kpiName) &&
        this.dataFiltered[prevItem].subCategory1 === this.dataFiltered[index].subCategory1 &&
        this.dataFiltered[prevItem].subCategory2 === this.dataFiltered[index].subCategory2 &&
        this.dataFiltered[prevItem].subCategory3 === this.dataFiltered[index].subCategory3
      ) {
        this.kpiCalculatedChecker(prevItem, index);
      } else if (
        nextItem !== index &&
        this.dataFiltered[nextItem] !== undefined &&
        this.dataFiltered[nextItem].kpiName.includes(kpiName) &&
        this.dataFiltered[nextItem].subCategory1 === this.dataFiltered[index].subCategory1 &&
        this.dataFiltered[nextItem].subCategory2 === this.dataFiltered[index].subCategory2 &&
        this.dataFiltered[nextItem].subCategory3 === this.dataFiltered[index].subCategory3
      ) {
        this.kpiCalculatedChecker(index, nextItem);
      }
    });

    // Assigning new filter data
    this.formTitle = this.dataFiltered[0].locationName;
    this.dataSource.data = this.dataFiltered;
  }

  kpiCalculatedChecker(index1: number, index2: number) {
    if (
      this.dataFiltered[index1].natureOfData === 'CALCULATED' ||
      this.dataFiltered[index1].natureOfData === 'calculated'
    ) {
      this.kpiCalculatedFormula(index1, index2);
    } else if (
      this.dataFiltered[index2].natureOfData === 'CALCULATED' ||
      this.dataFiltered[index2].natureOfData === 'calculated'
    ) {
      this.kpiCalculatedFormula(index2, index1);
    }
  }

  kpiCalculatedFormula(index1: number, index2: number) {
    if (this.dataFiltered[index1].kpiName.includes('/Cap/Year')) {
      this.dataFiltered[index1].newDataValue = (this.dataFiltered[index2].newDataValue / this.dataFiltered[index1].population);
    } else if (this.dataFiltered[index1].kpiName.includes('/Year')) {
      this.dataFiltered[index1].newDataValue = (this.dataFiltered[index2].newDataValue * this.dataFiltered[index1].population);
    }
  }

  tableFilter(tableLocation: string) {
    if (this.editingCell !== undefined) {
      this.cancelEdit(this.editingCell);
    }
    
    setTimeout(() => {
      this.locationYear.forEach((item: any) => {
        item.class = item.locationName === tableLocation ? 'active' : '';
      });
      this.dataFilter();
    });
  }

  editCell(rowIndex: number, column: string) {
    this.editingCell = this.editingCell !== undefined ? this.editingCell : undefined;

    if (this.editingCell !== undefined) {
      this.cancelEdit(this.editingCell);
    }

    setTimeout(() => {
      this.editingCell = rowIndex;
      const index = this.dataFiltered.findIndex((item: any) => item.rowIndex === rowIndex);
      const dataItem = this.dataFiltered[index];
      dataItem.dataAction = 'edit';
      this.formGroup.controls[column].patchValue(dataItem[column]);
    });
  }

  cancelEdit(rowIndex: number) {
    this.editingCell = undefined;
    const index = this.dataFiltered.findIndex((item: any) => item.rowIndex === rowIndex);
    this.dataFiltered[index].dataAction = 'none';
  }

  saveEdit(rowIndex: number, column: string) {
    const index = this.dataFiltered.findIndex((item: any) => item.rowIndex === rowIndex);
    const index2 = this.kpiData.findIndex((item: any) => item.rowIndex === rowIndex);
    const dataItem = this.dataFiltered[index];
    const mainDataItem = this.kpiData[index2];
    dataItem.dataAction = 'edited';
    dataItem[column] = this.formGroup.controls[column].value;
    mainDataItem[column] = this.formGroup.controls[column].value;
    this.dataFilter();
  }

}
