import { PublicProfileComponent } from '@/components/public-profile.component';

interface PublicProfileComponentProps {
  id: string;
}
const PublicProfilePage = ({ id }: PublicProfileComponentProps) => {
  return (
    <div className='p-2'>
      <PublicProfileComponent id={id} />
    </div>
  );
};

export default PublicProfilePage;
