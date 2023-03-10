USING AxUnit;
USING MyLibrary;

NAMESPACE MyTest

    {TestFixture}
    CLASS MyTestFixture

        VAR PROTECTED
            testInstance : MyClass;
        END_VAR

        {Test}
        METHOD PUBLIC MyTestMethod
            VAR_TEMP
                result : BOOL;
            END_VAR

            result := testInstance.DescriptiveMethodName();

            Assert.Equal(actual := result, expected := FALSE);
        
        END_METHOD
    END_CLASS

END_NAMESPACE
