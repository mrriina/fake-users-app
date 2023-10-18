import { useEffect, useState } from 'react';
import { Select, Slider, Button, Table } from "antd";
import { faker, fakerRU, fakerEN_US, fakerPL } from '@faker-js/faker';
import { CSVLink } from "react-csv";

const columns = [
  {
      title: '№',
      dataIndex: 'index',
  },
  {
      title: 'Id',
      dataIndex: 'id',
  },
  {
      title: 'Full name',
      dataIndex: 'fullName',
  },
  {
      title: 'Address',
      dataIndex: 'address',
  },
  {
      title: 'Phone',
      dataIndex: 'phone',
  },
];

const alphabetRU = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const alphabetEN = "aąbcćdeęfghijklłmnńoóprsśtuwyzźżABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const alphabetPL = "абвгдеёжзийклмнопрстуфхцчшщъыьэюяАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ0123456789";

function App() {
  const [users, setUsers] = useState([]);
  const [region, setRegion] = useState('ru');
  const [fakerRegion, setFakerRegion] = useState(fakerRU);
  const [alphabet, setAlphabet] = useState(alphabetRU);
  const [errorAmount, setErrorAmount] = useState();
  const [seed, setSeed] = useState(faker.seed());
  const [seedData, setSeedData] = useState([]);

  useEffect(() => {
    switch(region) {
      case 'ru':
        setFakerRegion(fakerRU);
        setAlphabet(alphabetRU);
        break;
      case 'pl':
          setFakerRegion(fakerPL);
          setAlphabet(alphabetPL);
          break;
      case 'us':
          setFakerRegion(fakerEN_US);
          setAlphabet(alphabetEN);
          break;
    }
  }, [region])

  useEffect(() => {
    fakerRegion.seed(+seed);
    setUsers(createUsers(20));
  }, [fakerRegion, errorAmount])

  useEffect(() => {
    if(seedData[String(seed)+String(errorAmount)]) {
      setUsers(seedData[String(seed)+String(errorAmount)])
    } else {
      setUsers(createUsers(20));
    }
  }, [seed])

  const createUsers = (usersCount, usersLength) => {
    usersLength = usersLength ? usersLength : 0
    const newUsers = []
    for(let i=0; i<usersCount; i++) {
      const newUser = {
        key: usersLength + i + 1,
        index: usersLength + i + 1,
        id: fakerRegion.string.uuid(),
        fullName: fakerRegion.person.fullName(),
        address: fakerRegion.location.streetAddress(),
        phone: fakerRegion.phone.number(),
      }

      generateErrors(newUser);
      newUsers.push(newUser);
    }

    let usersForSeed = {};
    usersForSeed[String(seed)+String(errorAmount)] = newUsers;
    setSeedData({...seedData, ...usersForSeed})
    return newUsers;
  }

  const generateErrors = (user) => {
    for (let j = 0; j < errorAmount; j++) {
      const field = faker.helpers.arrayElement([
        "fullName",
        "address",
        "phone",
      ]);
      const fieldValue = user[field];

      if(fieldValue.length > 0) {
        const errorType = Math.floor(Math.random() * 3);
        let index;
        
        switch (errorType) {
          case 0:
            index = Math.floor(Math.random() * fieldValue.length);
            user[field] = fieldValue.slice(0, index) + fieldValue.slice(index + 1);
            break;
          case 1:
            index = Math.floor(Math.random() * (fieldValue.length + 1));
            const char = alphabet[Math.floor(Math.random() * alphabet.length)];
            user[field] = fieldValue.slice(0, index) + char + fieldValue.slice(index);
            break;
          default:
            index = Math.floor(Math.random() * (fieldValue.length - 1));
            user[field] = fieldValue.slice(0, index) + fieldValue.charAt(index + 1) + fieldValue.charAt(index) + fieldValue.slice(index + 2);
            break;
        }
      }
    }
  }

  const handleScroll = (element) => {
    if (element.target.scrollTop + element.target.clientHeight <= element.target.scrollHeight - 1) {
      return;
    }  
    setUsers([...users, ...createUsers(10, users.length)]);
  };

  return (
        <div>
            <div className="header d-flex justify-content-center p-4">
                <div className="d-flex justify-content-center w-75">
                    <div className="mx-3">
                        <h6>Region</h6>
                        <Select
                            style={{
                                width: 120,
                            }}
                            onChange={(val)=>setRegion(val)}
                            value={region}
                          >
                            <Select.Option value="pl">Poland</Select.Option>
                            <Select.Option value="ru">Россия</Select.Option>
                            <Select.Option value="us">USA</Select.Option>
                        </Select>
                    </div>
                    <div style={{width: "30%"}}>
                        <h6>Errors:</h6>
                        <Slider 
                          onChange={(val)=>setErrorAmount(val)} 
                          value={errorAmount} 
                          max={10} min={0} 
                          defaultValue={0}
                          step={0.25}/>
                    </div>
                    <div className="mx-3">
                        <h6>Value:</h6>
                        <input 
                          onChange={(e)=>setErrorAmount(e.target.value)} 
                          className="input"
                          value={errorAmount}
                          max={1000} min={0} 
                          step={0.25}
                          type="number"/>
                    </div>
                    <div>
                        <h6>Seed</h6>
                        <input
                          value={seed} 
                          onChange={(e) => setSeed(Number(e.target.value))}
                          min={0}
                          className="input" 
                          type="number"/>
                        <Button onClick={()=>setSeed(faker.seed())} className='mx-3'>Generate</Button>
                        <CSVLink data={users}>
                          <Button type="dashed">
                            Export to CSV
                          </Button>
                        </CSVLink>
                    </div>
                </div>
            </div>
            <div className='overflow-auto p-4' onScroll={handleScroll} style={{ height: "470px" }}>
              <Table bordered hover 
                columns={columns}
                dataSource={users}
                pagination={false}>
              </Table>
            </div>
        </div>
  );
}

export default App;