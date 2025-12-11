import { PublicTrainerProfileComponent } from '@/components/trainer-profile/public-trainer-profile.component';
interface PublicTrainerProfileComponentProps {
  id: string;
}
const PublicTrainerProfilePage = ({ id }: PublicTrainerProfileComponentProps) => {
  return (
    <div className='p-2'>
      <PublicTrainerProfileComponent id={id} />
    </div>
  );
};

export default PublicTrainerProfilePage;
