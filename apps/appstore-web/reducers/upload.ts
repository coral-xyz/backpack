export function uploadReducer(state, action) {
  switch (action.type) {
    case 'field': {
      return {
        ...state,
        [action.field]: action.value
      };
    }
    case 'file': {
      return {
        ...state,
        [action.field]: action.value
      };
    }
    case 'reset': {
      return uploadInitialState;
    }
  }
}

export const uploadInitialState = {
  title: '',
  description: '',
  website: '',
  discord: '',
  twitter: '',
  price: 0,
  bundle: {},
  icon: {},
  screenshots: {},
  s3UrlBundle: '',
  s3UrlIcon: '',
  s3UrlScreenshots: ''
};
