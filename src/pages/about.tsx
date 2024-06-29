const About = () => {
  return (
    <section>
      <div>
        <br />
        <h1 > About EV-map</h1>
        <ul className="bullet-list">
          <li>
            CalEnviroScreen4.0 percentile: Slide to define the range of CalEnviroScreen percentile scores
            included in the &quot;priority&quot; pixel set. A higher range (e.g., 70-100) will limit the set to
            show only those areas scoring highest across the CES4.0 environmental vulnerability indicators.
          </li>
          <li>
            L2 chargers within 10 min walk: Slide the range down to exclude pixels with multiple existing Level
            Level 2 chargers available within a 10 minute walk of the pixel.
          </li>
          <li>
            PG&E load capacity: Increase the bottom slider to exclude areas with electrical distribution grid
            capacity (in kW) lower than the indicated number.
          </li>
          <li>
            NEVI and IRS 30C eligible: Toggle on to show areas eligible for either funding source; toggle both
            on to show areas eligible for both.
          </li>
        </ul>
        <br />
        <p>
          We are actively adding more criteria, expanding to new geographies, refining data, and improving the
          user interface. We welcome your feedback.
        </p>
      </div>
    </section>
  );
};

export default About;