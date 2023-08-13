import SortView from '../view/sort-view.js';
import PointView from '../view/point-view.js';
import NewPointView from '../view/new-point-view.js';
import EditPointView from '../view/edit-point-view.js';
import ListView from '../view/list-view.js';
import { render } from '../render.js';

export default class TripEventsPresenter {
  tripSortComponent = new SortView();
  tripEventsComponent = new ListView();

  constructor ({tripEventsContainer, pointsModel}) {
    this.tripEventsContainer = tripEventsContainer;
    this.pointsModel = pointsModel;
  }

  init() {
    this.tripEventsPoints = this.pointsModel.getPoints().map((point) => ({
      ...point,
      offers: this.pointsModel.getOffersForPoint(point),
      destination: this.pointsModel.getDestinationForPoint(point)
    }));

    render(this.tripSortComponent, this.tripEventsContainer);
    render(this.tripEventsComponent, this.tripEventsContainer);

    // Передаем tripEventsPoints в EditPointView и NewPointView
    render(new EditPointView({ tripEventsPoints: this.tripEventsPoints }), this.tripEventsComponent.getElement());

    this.renderPoints(this.tripEventsPoints);
    render(new NewPointView({ tripEventsPoints: this.tripEventsPoints }), this.tripEventsComponent.getElement());
  }

  renderPoints(points) {
    for (const point of points) {
      const pointView = new PointView({ tripEventsPoints: point });
      render(pointView, this.tripEventsComponent.getElement());
    }
  }
}
