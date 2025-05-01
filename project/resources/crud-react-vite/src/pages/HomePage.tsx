import { styled } from '@mui/material';

const ContainerHome = styled('div')({
    background: 'white',
    padding: '40px',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    width: '90%',
    maxWidth: '600px',
    margin: 'auto',
    lineHeight: '5em',
});

const Header = styled('div')({
    textAlign: 'center',
    marginBottom: '40px',
    '& h1': {
        color: '#2c3e50',
        fontSize: '2.5em',
        marginBottom: '10px',
    },
    '& p': {
        color: '#7f8c8d',
        fontSize: '1.1em',
    },
});

const ButtonGrid = styled('div')({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '20px',
});

const CrudButton = styled('button')({
    padding: '15px',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '1em',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
    },
});

const CreateButton = styled(CrudButton)({
    background: '#2ecc71',
});

const ReadButton = styled(CrudButton)({
    background: '#3498db',
});

const UpdateButton = styled(CrudButton)({
    background: '#f1c40f',
});

const DeleteButton = styled(CrudButton)({
    background: '#e74c3c',
});

const Footer = styled('div')({
    textAlign: 'center',
    marginTop: '30px',
    color: '#95a5a6',
    fontSize: '0.9em',
});

export default function HomePage() {
    return (
        <ContainerHome>
            <Header>
                <h1>Bienvenue</h1>
                <p>Gérez vos données facilement avec notre application CRUD</p>
            </Header>

            <ButtonGrid>
                <CreateButton>Créer</CreateButton>
                <ReadButton>Lire</ReadButton>
                <UpdateButton>Modifier</UpdateButton>
                <DeleteButton>Supprimer</DeleteButton>
            </ButtonGrid>

            <Footer>© 2025 Application CRUD</Footer>
        </ContainerHome>
    );
}