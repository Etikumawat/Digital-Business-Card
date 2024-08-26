import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { Delete, Edit, Email, Scanner, Visibility, WhatsApp } from '@mui/icons-material';
import { TableCell, TableRow, Tooltip } from '@mui/material';

// Styled IconButton with hover effect
const StyledIconButton = styled(IconButton)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.primary.main, // Change color on hover
  },
}));

function UserTableRow({
  sr,
  name,
  company,
  department,
  designation,
  phone,
  email,
  qrcodeUrl,
  selected,
  handleClick,
  onQRCodeClick,
  handleDelete,
  handleSendQr,
  handleUpdate,
  handleView,
  handleScan,
  handleSendEmail,
}) {
  return (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox" sx={{ minWidth: 50 }}>
        {/* <Checkbox checked={selected} /> */}
      </TableCell>
      <TableCell sx={{ minWidth: 100 }}>{sr}</TableCell>
      <TableCell sx={{ minWidth: 150 }}>{name}</TableCell>
      <TableCell sx={{ minWidth: 150 }}>{company}</TableCell>
      <TableCell sx={{ minWidth: 150 }}>{department}</TableCell>
      <TableCell sx={{ minWidth: 150 }}>{designation}</TableCell>
      <TableCell sx={{ minWidth: 150 }}>{phone}</TableCell>
      <TableCell sx={{ minWidth: 200 }}>{email}</TableCell>
      <TableCell sx={{ minWidth: 100 }}>
        <img
          src={qrcodeUrl}
          alt="QR Code"
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            onQRCodeClick();
          }}
        />
      </TableCell>
      <TableCell sx={{ maxWidth: 40 }}>
        <Tooltip title="View Card">
          <StyledIconButton onClick={handleView}>
            <Visibility />
          </StyledIconButton>
        </Tooltip>
      </TableCell>
      <TableCell sx={{ minWidth: 120, textAlign: 'center' }}>
        <Tooltip title="Scan History">
          <StyledIconButton onClick={handleScan}>
            <Scanner />
          </StyledIconButton>
        </Tooltip>
      </TableCell>
      <TableCell sx={{ maxWidth: 40 }}>
        <Tooltip title="Update Card">
          <StyledIconButton onClick={handleUpdate}>
            <Edit />
          </StyledIconButton>
        </Tooltip>
      </TableCell>
      <TableCell sx={{ maxWidth: 40 }}>
        <Tooltip title="Delete Card">
          <StyledIconButton onClick={handleDelete}>
            <Delete />
          </StyledIconButton>
        </Tooltip>
      </TableCell>
      <TableCell>
        <Tooltip title="Send QR Via WhatsApp">
          <StyledIconButton onClick={handleSendQr}>
            <WhatsApp />
          </StyledIconButton>
        </Tooltip>
        <Tooltip title="Send QR Via Email">
          <StyledIconButton onClick={handleSendEmail}>
            <Email color="grey" />
          </StyledIconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

export default UserTableRow;
