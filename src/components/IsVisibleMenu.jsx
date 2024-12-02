import { useAuth } from '../hooks/useAuth';
import { Navbar } from './Navbar';

export const IsVisibleMenu = () => {
    //const { user } = useAuth();
    const user=true;
    if (user) {
        // user is not authenticated
        return <Navbar />;
    }else
          return <></>;
}
