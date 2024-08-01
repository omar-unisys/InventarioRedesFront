import { useAuth } from '../hooks/useAuth';
import { Navbar } from './Navbar';

export const IsVisibleMenu = () => {
    const { user } = useAuth();
    if (user) {
        // user is not authenticated
        return <Navbar />;
    }else
          return <></>;
}
