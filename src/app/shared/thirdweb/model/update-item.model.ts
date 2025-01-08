import { NewItem } from './new-item.model';

export type UpdateItem = Partial<Omit<NewItem, 'image'>> & {
  newImage?: File;
  oldImage: string;
};
