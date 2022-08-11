import styled from "styled-components";

export const StyledContainer = styled.div`
  min-height: 100vh;
  padding: 20px;
  
  background: #83a4d4;
  background: linear-gradient(to left, #b6fbff, #83a4d4);

  color: #171212;
`;

export const StyledHeadlinePrimary = styled.h1`
  font-size: 48px;
  font-weight: 300;
  letter-spacing: 2px;
`;

export const StyledItem = styled.li`
  display: flex;
  align-items: center;
  padding-bottom: 5px;
`;

export const StyledHeadItem = styled(StyledItem)`
  font-weight: 600;
  font-size: 1.5rem;
  border-bottom: 1px solid black;
  margin-bottom: 15px;
`;

export const StyledColumn = styled.span`
  padding: 0 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  a {
    color: inherit;
  }

  width: ${(props) => props.width};
`;

export const StyledButton = styled.button`
  background: transparent;
  border: 1px solid #171212;
  padding: 5px;
  cursor: pointer;

  transition: all 0.1s ease-in;

  &:hover {
    background: #171212;
    color: #ffffff;
  }
`;

export const StyledButtonSmall = styled(StyledButton)`
  padding: 5px;
`;

export const StyledButtonLarge = styled(StyledButton)`
  padding: 10px;
`;

export const StyledSearchForm = styled.form`
  padding: 10px;
  display: flex;
  align-items: baseline;
`;

export const StyledLabel = styled.label`
  padding-left: 5px;
  font-size: 24px;
  border-top: 1px solid #171212;
  border-left: 1px solid #171212;
`;

export const StyledInput = styled.input`
  border: none;
  border-bottom: 1px solid #171212;
  background-color: transparent;
  font-size: 24px;
  box-sizing: border-box;

  :focus {
    outline: none;
    box-shadow: 0 0 10px #ff0028;
  }
`;

export const StyledCheckmark = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  height: 25px;
  width: 25px;
  background-color: #eee;

  :after {
    content: "";
    position: absolute;
    display: none;
  }
`;

export const StyledCheckboxContainer = styled.label`
  display: block;
  position: relative;
  padding-left: 35px;
  margin-bottom: 12px;
  cursor: pointer;
  font-size: 22px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  margin-left: 15px;

  input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  // :hover input ~ ${StyledCheckmark} {
  //   background-color: #ccc;
  // }

  input:checked ~ ${StyledCheckmark} {
    background-color: #ff0028;
  }

  input:checked ~ ${StyledCheckmark}:after {
    display: block;
  }

  ${StyledCheckmark}:after {
    left: 9px;
    top: 5px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 3px 3px 0;
    -webkit-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
  }
`;

