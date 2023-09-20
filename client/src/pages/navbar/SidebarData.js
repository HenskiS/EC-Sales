import * as AiIcons from "react-icons/ai";
import * as IoIcons from "react-icons/io";


export const SidebarData = [
    {
        title: 'Dashboard',
        path: '/',
        /*icon: <AiIcons.AiOutlineFileText />,*/
        icon: <IoIcons.IoMdPaper />,
        cName: 'nav-text'
    },
    {
        title: 'Photos',
        path: '/photos',
        icon: <AiIcons.AiOutlinePicture />,
        cName: 'nav-text'
    },
    {
        title: 'Rep Personal',
        path: '/reppersonal',
        icon: <AiIcons.AiOutlineFileText />,
        cName: 'nav-text'
    },
    {
        title: 'Client List',
        path: '/clientlist',
        icon: <IoIcons.IoMdPeople />,
        cName: 'nav-text'
    },
    {
        title: 'Login',
        path: '/auth',
        icon: <IoIcons.IoIosLock />,
        cName: 'nav-text'
    }
]