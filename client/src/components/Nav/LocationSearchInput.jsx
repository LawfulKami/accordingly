import React from 'react';
import PlacesAutocomplete from 'react-places-autocomplete';
 
class LocationSearchInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = { address: '', draft_address: '' };
  }
 
  handleChange = draft_address => {
    this.setState(state => ({ address: state.address, draft_address }));
    this.props.onChange(draft_address);
  };
 
  handleSelect = address => {
    this.setState({ draft_address: address, address });
    this.props.onChange(address);
    // geocodeByAddress(address)
    //   .then(results => getLatLng(results[0]))
    //   .then(latLng => console.log('Success', latLng))
    //   .catch(error => console.error('Error', error));
  };

  handleBlur = () => {
    if (this.state.address !== this.state.draft_address) {
      this.setState({ draft_address: '', address: '' });
      this.props.onChange('');
    }
  };
 
  render() {
    return (
      <PlacesAutocomplete
        value={this.state.draft_address || this.props.destination}
        onChange={this.handleChange}
        onSelect={this.handleSelect}
        highlightFirstSuggestion={true}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div>
            <label htmlFor='location_search'>Location</label>
            <input
              {...getInputProps({
                id: 'location_search',
                placeholder: 'Search Places ...',
                className: 'location_search_input',
                onBlur: () => this.handleBlur(),
                required: true,
              })}
            />
            <div className="autocomplete-dropdown-container">
              {loading && <div>Loading...</div>}
              {suggestions.map(suggestion => {
                const className = suggestion.active
                  ? 'suggestion-item--active'
                  : 'suggestion-item';
                // inline style for demonstration purpose
                const style = suggestion.active
                  ? { color: 'white', backgroundColor: 'black', cursor: 'pointer' }
                  : { color: 'white', backgroundColor: 'grey', cursor: 'pointer' };
                return (
                  <div
                    {...getSuggestionItemProps(suggestion, {
                      className,
                      style,
                    })}
                  >
                    <span>{suggestion.description}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </PlacesAutocomplete>
    );
  }
}

export default LocationSearchInput;