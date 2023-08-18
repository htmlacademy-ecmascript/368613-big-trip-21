import { pointsMock, destinationsMock, offersMock } from '../data-mocks.js';

const POINT_COUNT = 3;

export default class PointsModel {
  constructor() {
    this.points = pointsMock.slice(0, POINT_COUNT);//Array.from({length: POINT_COUNT}, generatePoint);
    this.offers = offersMock;
    this.destinations = destinationsMock;
  }

  getPoints() {
    return this.points;
  }

  getOffers() {
    return this.offers;
  }

  getDestinations() {
    return this.destinations;
  }

  getCheckedOffersForPoint(point) {
    const pointTypeOffers = this.offers.find((offer) => offer.type === point.type);
    return pointTypeOffers ? pointTypeOffers.offers
      .filter((offer) => point.offers.includes(offer.id)) : [];
  }

  getDestinationForPoint(point) {
    return this.destinations.find((destination) => destination.id === point.destination);
  }

}
