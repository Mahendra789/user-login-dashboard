import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BOOKSLIST, RATING_AS } from '../constants';
import * as moment from 'moment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  filterForm: FormGroup;
  booklist = [...BOOKSLIST];
  filteredBookList = [...BOOKSLIST];
  ratingAs = [...RATING_AS];
  filterData: any;
  email: any;

  constructor(
    private _fb: FormBuilder,
    private _router: Router

  ) {
    this.filterForm = this._createFormGroup();

    this.email = window.localStorage.getItem('email');

    if (window.localStorage.getItem('filters')) {
      this.filterData = window.localStorage.getItem('filters');
      this.filterData = JSON.parse(this.filterData);
      this.filterForm = this._updateFromGroup();
      this._filterList();
    } else {
      this.filterForm.reset();
    }
  }

  ngOnInit(): void { }

  logout(): void {
    window.localStorage.clear();
    this._router.navigate(['/login']);
  }

  onApplyClick(): void {
    this._updateFilters();
  }

  onResetClick(): void {
    this.filterForm.reset();
    this._updateFilters();
  }

  private _updateFilters(): void {
    this.filterData = { ...this.filterForm.getRawValue() };
    this._filterList();
    window.localStorage.setItem('filters', JSON.stringify(this.filterData));
  }

  private _filterList(): void {
    let filterList = this.booklist.filter(x => {
      if (
        (this.filterData.name ? x.bookName.toLocaleLowerCase().startsWith(this.filterData.name.toLocaleLowerCase()) : true) &&
        (this.filterData.toDate || this.filterData.fromDate ? this._dateFilter(x, this.filterData) : true) &&
        (this.filterData.price ? (this.filterData.price == x.price) : true) &&
        (this.filterData.rating ? this._ratingFilter(x, this.filterData) : true) &&
        ((this.filterData.availability == true || this.filterData.availability == false) ? (this.filterData.availability == x.availability) : true)
      ) {
        return x;
      } else { return null }
    });
    this.filteredBookList = filterList;
  }

  private _ratingFilter(item: any, filterData: any) {
    if (filterData.ratingAs == this.ratingAs[0]) {
      return item.rating == filterData.rating;
    } else if (filterData.ratingAs == this.ratingAs[1]) {
      return item.rating < filterData.rating;
    } else if (filterData.ratingAs == this.ratingAs[2]) {
      return item.rating > filterData.rating;
    } else if (filterData.ratingAs == this.ratingAs[3]) {
      return item.rating <= filterData.rating;
    } else {
      return item.rating >= filterData.rating;
    }

  }

  private _dateFilter(item: any, filterData: any) {

    var from = filterData.fromDate ? moment(filterData.fromDate).format('YYYY/MM/DD') : null;
    var to = filterData.toDate ? moment(filterData.toDate).format('YYYY/MM/DD') : null;
    var check = item.releaseDate ? moment(item.releaseDate, 'DD/MM/YYYY').format('YYYY/MM/DD') : null;

    if (filterData.toDate && filterData.fromDate) {
      return moment(check).isBetween(from, to);
    } else if (to || from) {
      return moment(check).isSame(to) || moment(check).isSame(from);
    } else {
      return false;
    }

  }


  private _createFormGroup(): FormGroup {
    return this._fb.group({
      name: [''],
      fromDate: [''],
      toDate: [''],
      price: [''],
      ratingAs: [''],
      rating: [''],
      availability: [''],
    });
  }

  private _updateFromGroup(): FormGroup {
    return this._fb.group({
      name: this.filterData.name,
      fromDate: this.filterData.fromDate,
      toDate: this.filterData.toDate,
      price: this.filterData.price,
      ratingAs: this.filterData.ratingAs,
      rating: this.filterData.rating,
      availability: this.filterData.availability
    });
  }
}
