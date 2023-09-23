import SortView from '../view/sort-view.js';
import ListView from '../view/list-view.js';
import NoPointView from '../view/no-point-view.js';
import { render, remove, replace, RenderPosition } from '../framework/render.js';
import PointPresenter from './point-presenter.js';
import NewPointPresenter from './new-point-presenter.js';
import { sort } from '../utils/sort.js';
import { SortType, UpdateType, UserAction, filter, FilterType, Mode } from '../utils/utiles.js';

export default class TripEventsPresenter {
  #tripEventsContainer = null;
  #pointsModel = null;
  #filterModel = null;
  #formStateModel = null;

  #tripSortComponent = null;
  #tripListComponent = new ListView();
  #noPointComponent = null;

  #newPointPresenter = null;
  #pointPresenters = new Map();
  #currentSortType = SortType.DAY;
  #filterType = FilterType.EVERYTHING;

  constructor ({tripEventsContainer, pointsModel, filterModel, formStateModel}) {
    this.#tripEventsContainer = tripEventsContainer;
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;
    this.#formStateModel = formStateModel;

    this.#newPointPresenter = new NewPointPresenter({
      pointListContainer: this.#tripListComponent.element,
      allOffers: this.#pointsModel.offers,
      allDestinations: this.#pointsModel.destinations,
      onDataChange: this.#handleViewAction,
      onDestroy: this.#handleNewPointDestroy,
    });

    this.#formStateModel.addObserver(this.#handleFormStateChanged);
    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get points() {
    this.#filterType = this.#filterModel.filter;

    const points = this.#pointsModel.enrichedPoints;
    const filteredPoints = filter[this.#filterType](points);

    return sort[this.#currentSortType](filteredPoints);
  }

  init() {

    this.#renderTripEvents();
  }

  #handleViewAction = (actionType, updateType, update) => {
    switch (actionType) {
      case UserAction.UPDATE_EVENT:
        this.#pointsModel.updatePoint(updateType, update);
        break;
      case UserAction.ADD_EVENT:
        this.#pointsModel.addPoint(updateType, update);
        break;
      case UserAction.DELETE_EVENT:
        this.#pointsModel.deletePoint(updateType,update);
        break;
    }
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#pointPresenters.get(data.id).init(data);
        break;
      case UpdateType.MINOR:
        this.#clearTripEvents();
        this.#renderTripEvents();
        break;
      case UpdateType.MAJOR:
        this.#clearTripEvents({resetSortType: true});
        this.#renderTripEvents();
        break;
    }
  };

  #handleModeChange = () => {
    this.#newPointPresenter.destroy();
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #handleFormStateChanged = (state) => {
    if (state === Mode.CREATING) {
      this.#handleNewPointFormOpen();
    }
  };

  #handleNewPointFormOpen() {
    this.#currentSortType = SortType.DAY;
    this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);

    this.#newPointPresenter.init();
  }


  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;

    this.#clearPointList();
    this.#renderTripEvents();
  };

  #handleNewPointDestroy = () => {


    if(!this.points.length){
      remove(this.#tripSortComponent && this.#formStateModel.formState !== Mode.CREATING);
      this.#tripSortComponent = null;
      this.#renderNoPoints();
    }
    this.#formStateModel.formState = Mode.DEFAULT;

  };


  #clearPointList() {
    this.#newPointPresenter.destroy();
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
  }

  #clearTripEvents({resetSortType = false} = {}){
    this.#clearPointList();

    remove(this.#tripSortComponent);

    if(this.#noPointComponent){
      remove(this.#noPointComponent);
    }

    if(resetSortType){
      this.#currentSortType = SortType.DAY;
    }
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({pointListContainer: this.#tripListComponent.element,
      allOffers: this.#pointsModel.offers, allDestinations: this.#pointsModel.destinations,
      onDataChange: this.#handleViewAction, onModeChange: this.#handleModeChange});
    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #renderSort() {

    const prevSortComponent = this.#tripSortComponent;

    this.#tripSortComponent = new SortView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange
    });

    if(prevSortComponent){
      replace(this.#tripSortComponent, prevSortComponent);
      remove(prevSortComponent);
    }else{
      render(this.#tripSortComponent, this.#tripEventsContainer);
    }
    render(this.#tripSortComponent, this.#tripEventsContainer, RenderPosition.AFTERBEGIN);
  }


  #renderNoPoints() {
    this.#noPointComponent = new NoPointView({
      filterType: this.#filterType
    });
    render(this.#noPointComponent, this.#tripEventsContainer, RenderPosition.AFTERBEGIN);
  }

  #renderPoints(points) {
    points.forEach((point) => {
      this.#renderPoint(point);
    });
  }

  #renderPointsList() {
    render(this.#tripListComponent, this.#tripEventsContainer);
  }

  #renderTripEvents() {

    if (!this.points.length) {
      this.#renderNoPoints();
      return;
    }
    this.#renderSort();
    this.#renderPointsList();
    this.#renderPoints(this.points);
  }

}
