import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import { queryStormName } from './filter_utils';


export const input_filters = [
  {
    "name": 'stormName',
    "display_name": 'Storm Name',
    'Icon': BadgeOutlinedIcon,
    "placeholder": 'Abba',
    'query': queryStormName
  },
]
