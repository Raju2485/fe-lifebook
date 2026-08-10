import { Button, Flex, Modal, Form, Row, Col, Space, Input, Card as AntCard } from 'antd';
const {Item: FormItem} = Form;
import { useOrgsQuery, useCreateOrgMutation } from '../services/apiSlice';
import { Card } from './Card';
import { useState } from 'react';
import { useShowMessage } from '../../../hooks/useShowMessage.js';
import './BusinessAndAccounts.scss';


// import CustomModal from '../../../../common/CustomModal';

function BusinessAndAccounts() {
  
  const [form2] = Form.useForm();

  const [open, setOpen] = useState(false);
  const [isModalSubmitDisabled, setIsModalSubmitDisabled] = useState(false);
  const { showMessage } = useShowMessage()

  const { data } = useOrgsQuery(
    // { count: 5 }, 
    // This option forces a refetch on component mount
    { refetchOnMountOrArgChange: true }
  )
  const [createOrg] = useCreateOrgMutation();
  // #region Create Organization Modal functionality - Start
  const handleModel = async () => {
    // await form.validateFields();
    setOpen(true);
    console.log('open = ' , open);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const onFinishModal = async () => {
    try {
      setIsModalSubmitDisabled(true);
      const values = await form2.validateFields();

      const response = await createOrg({ ...values });

      if (response?.data?.success === true) {
        form2.resetFields();
        setOpen(false);
        showMessage({ type: 'success', content: response?.data?.message ?? 'Organization created' });
      } else {
        showMessage({ type: 'error', content: response?.error?.data?.message ?? 'Failed to create organization' });
      }
    } catch (info) {
      console.log('Validate Failed:', info);
    } finally {
      setIsModalSubmitDisabled(false);
    }
  };


  // #endregion Create Organization Modal functionality - Ends
  return (
    <div className="business-and-accounts">
      <div className="business-and-accounts__toolbar">
        <Button type="primary" onClick={() => handleModel()}>
          Create Organization
        </Button>
      </div>

      <Flex wrap gap="small" className="business-and-accounts__cards">
        {data?.data?.map((obj) => (
          <Card key={obj.id} obj={obj} />
        ))}
      </Flex>

      <Modal
              title=""
              open={open}
              width="50%"
              footer={null}
              // className={styles.customModal}
              closable={false}
              onCancel={handleClose}
            >
              <div 
              // className={`${styles.table_row}`}
              >
                <Form form={form2} layout="vertical" onFinish={onFinishModal}>
                  <AntCard
                    title={'Create Organization'}
                    // className={styles.CustomPanel}
                  >
                    <Row gutter={24}>
                      <Col xs={24} xl={12} span={24} md={24} sm={24}>
                        <FormItem
                          label="Organization Name:"
                          name="name"
                          rules={[
                            {
                              required: true,
                              message: 'Enter Organization Name'
                            }
                          ]}
                        >
                          <Input placeholder="Enter Organization Name" />
                        </FormItem>
                      </Col>
                    </Row>
                  </AntCard>

                  <FormItem className="text-center">
                    <Space>
                      <Button
                        // className={styles.inwardButton}
                        htmlType="submit"
                        type="primary"
                        size="medium"
                        disabled={isModalSubmitDisabled}
                      >
                        Submit
                      </Button>
                      <Button
                        // className={styles.inwardButton}
                        onClick={handleClose}
                        type="primary"
                        ghost
                        size="medium"
                      >
                        Close
                      </Button>
                    </Space>
                  </FormItem>
                </Form>
              </div>
            </Modal>
    </div>
  )
}

export { BusinessAndAccounts }