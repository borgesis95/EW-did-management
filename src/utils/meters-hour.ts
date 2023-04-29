export interface solarCurveDto {
  /**From hours */
  from: number;
  /** To hours */
  to: number;

  /**Min energy that could be produced */
  min: number;
  /**max energy that could be produced */

  max: number;
}

export const LOWER_BOUND_ENERGY = 0;
export const UPPER_BOUND_ENERGY = 350;

export const solarCurveValues: solarCurveDto[] = [
  {
    from: 0,
    to: 3,
    min: LOWER_BOUND_ENERGY,
    max: LOWER_BOUND_ENERGY,
  },
  {
    from: 3,
    to: 6,
    min: LOWER_BOUND_ENERGY,
    max: LOWER_BOUND_ENERGY,
  },
  {
    from: 6,
    to: 9,
    min: LOWER_BOUND_ENERGY,
    max: 100,
  },
  {
    from: 9,
    to: 12,
    min: 100,
    max: 200,
  },
  {
    from: 12,
    to: 15,
    min: 200,
    max: UPPER_BOUND_ENERGY,
  },
  {
    from: 15,
    to: 18,
    min: 100,
    max: 200,
    // min: 150,
    // max: 250,
  },
  {
    from: 18,
    to: 21,
    min: 50,
    max: 100,
  },
  {
    from: 21,
    to: 24,
    min: LOWER_BOUND_ENERGY,
    max: LOWER_BOUND_ENERGY,
  },
];
