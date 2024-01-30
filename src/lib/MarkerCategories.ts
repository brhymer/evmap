import { Leaf, LocateFixed, LucideProps, PersonStanding } from 'lucide-react' // Import LocationMarker
import { FunctionComponent } from 'react'
import colors from 'tailwindcss/colors'

export enum Category {
 LOCATE = 0,
 CAT1 = 1,
 CAT2 = 2,
}

export interface MarkerCategoriesValues {
 name: string
 icon: FunctionComponent<LucideProps>
 color: string
 hideInMenu?: boolean
}

type MarkerCategoryType = {
 [key in Category]: MarkerCategoriesValues
}

const MarkerCategories: MarkerCategoryType = {
 [Category.LOCATE]: {
   name: 'User Location',
   icon: Leaf,
   color: colors.green[400],
   hideInMenu: false,
 },
 [Category.CAT1]: {
   name: 'Cities',
   icon: LocateFixed, // Use LocationMarker for cities
   color: colors.blue[400],
 },
 [Category.CAT2]: {
   name: 'Neighborhoods',
   icon: PersonStanding, // Keep PersonStanding for neighborhoods
   color: colors.red[400],
 },
}

export default MarkerCategories
